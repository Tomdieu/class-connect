from celery import shared_task
from celery.utils.log import get_task_logger
from ..models import Transaction, Payment, Subscription, SubscriptionPlan
from django.contrib.auth import get_user_model
from django.utils import timezone
import json
import base64
import uuid
from django.core.cache import cache

logger = get_task_logger(__name__)
User = get_user_model()

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={'max_retries': 3, 'countdown': 5}
)
def process_payment_task(self, webhook_data):
    """
    Process payment asynchronously using Celery with endpoint validation
    """
    try:
        logger.info(f"Starting process_payment_task with webhook_data: {webhook_data}")

        # Check if webhook_data is empty
        if not webhook_data:
            logger.error("Webhook data is empty!")
            return {
                'status': 'error',
                'message': 'Webhook data is empty'
            }

        # Create Transaction record
        # try:
        #     reference = webhook_data.get('reference', str(uuid.uuid4()))
        #     # Check if transaction already exists
        #     if Transaction.objects.filter(reference=reference).exists():
        #         logger.warning(f"Transaction with reference {reference} already exists. Skipping creation.")
        #         transaction = Transaction.objects.get(reference=reference)  # Get the existing transaction
        #     else:
        #         external_reference_str = webhook_data.get('external_reference')
        #         if external_reference_str:
        #             try:
        #                 external_reference = uuid.UUID(external_reference_str)
        #             except ValueError:
        #                 logger.error(f"Invalid UUID format for external_reference: {external_reference_str}")
        #                 external_reference = None  # Or handle the error as appropriate
        #         else:
        #             external_reference = None

        #         transaction = Transaction.objects.create(
        #             reference=reference,
        #             status=webhook_data.get('status', 'PENDING'),
        #             amount=webhook_data.get('amount'),
        #             app_amount=webhook_data.get('app_amount'),
        #             currency=webhook_data.get('currency', 'XAF'),
        #             operator=webhook_data.get('operator', 'MTN'),
        #             endpoint=webhook_data.get('endpoint', ''),  # Get endpoint from webhook
        #             code=webhook_data.get('code', ''),
        #             operator_reference=webhook_data.get('operator_reference', ''),
        #             phone_number=webhook_data.get('phone_number', ''),
        #             signature=webhook_data.get('signature', ''),
        #             external_reference=external_reference  # Pass the UUID object or None
        #         )
        #         logger.info(f"Transaction created with reference: {transaction.reference}")
        # except Exception as e:
        #     logger.error(f"Error creating Transaction: {str(e)}")
        #     return {
        #         'status': 'error',
        #         'message': f'Error creating Transaction: {str(e)}'
        #     }
        
        transaction_id = webhook_data.get('external_reference')
        try:
            transaction = Transaction.objects.get(reference=transaction_id)
        except Transaction.DoesNotExist:
            logger.error(f"Transaction with reference {transaction_id} not found.")
            return {
                'status': 'error',
                'message': f'Transaction with reference {transaction_id} not found.'
            }

        # Only process subscription for collect endpoint
        if transaction.endpoint != 'collect':
            logger.info(f"Transaction is not a 'collect' endpoint, skipping further processing. Endpoint: {transaction.endpoint}")
            
            # Update transaction status to successful for withdraw endpoint
            if transaction.endpoint == 'withdraw' and webhook_data.get('status') == 'SUCCESSFUL':
                transaction.status = 'SUCCESSFUL'
                transaction.save()
                logger.info(f"Withdraw transaction status updated to SUCCESSFUL. Transaction ID: {transaction.reference}")
            
            return {
                'status': 'success',
                'message': 'Non-collect transaction recorded',
                'transaction_id': str(transaction.reference)
            }

        # Get the full reference data from Redis
        transaction_id = webhook_data.get('external_reference')
        cache_key = f"payment_ref_{transaction_id}"
        reference_data_str = cache.get(cache_key)

        if not reference_data_str:
            logger.warning(f"Reference data not found in Redis for transaction_id: {transaction_id}")
            # Extract IDs from short reference format
            # Format: p{plan_id}u{user_id}h{hash}
            try:
                parts = transaction_id.split('h')[0]  # Get part before hash
                plan_id = parts.split('u')[0][1:]  # Extract plan_id
                user_id = parts.split('u')[1]  # Extract user_id

                reference_data = {
                    'plan_id': plan_id,
                    'user_id': user_id
                }
                logger.info(f"Extracted reference data from transaction_id: {reference_data}")
            except (IndexError, ValueError) as e:
                logger.error(f"Invalid transaction reference format: {str(e)}")
                transaction.status = 'FAILED'
                transaction.save()
                return {
                    'status': 'error',
                    'message': 'Invalid transaction reference format'
                }
        else:
            try:
                reference_data = json.loads(reference_data_str)
                logger.info(f"Reference data loaded from Redis: {reference_data}")
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding reference data from Redis: {str(e)}")
                transaction.status = 'FAILED'
                transaction.save()
                return {
                    'status': 'error',
                    'message': 'Error decoding reference data from Redis'
                }

        # Verify and decode the external reference
        try:
            if reference_data_str:  # Use reference_data from Redis
                reference_data = json.loads(reference_data_str)

                # Validate reference data structure
                required_fields = ['plan_id', 'user_id', 'uuid']
                if not all(field in reference_data for field in required_fields):
                    raise ValueError("Invalid reference data structure")
            else:
                raise ValueError("Transaction external_reference is None and no Redis data found")

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Error decoding or validating external reference: {str(e)}")
            transaction.status = 'FAILED'
            transaction.save()
            return {
                'status': 'error',
                'message': 'Invalid external reference format'
            }

        if webhook_data.get('status') == 'SUCCESSFUL':
            try:
                # Verify user and plan exist
                user = User.objects.get(id=reference_data['user_id'])
                plan = SubscriptionPlan.objects.get(id=reference_data['plan_id'])
                logger.info(f"User and Plan found. User ID: {user.id}, Plan ID: {plan.id}")

                # Create or update subscription
                subscription, created = Subscription.objects.get_or_create(
                    user=user,
                    plan=plan,
                    defaults={
                        'start_date': timezone.now(),
                        'end_date': timezone.now() + timezone.timedelta(days=plan.duration_days),
                        'is_active': True
                    }
                )

                if not created:
                    subscription.activate()
                    logger.info(f"Subscription activated. Subscription ID: {subscription.id}")
                else:
                    logger.info(f"Subscription created. Subscription ID: {subscription.id}")

                # Create payment record
                payment = Payment.objects.create(
                    user=user,
                    subscription=subscription,
                    amount=transaction.amount,
                    payment_method=transaction.operator,
                    transaction_id=str(transaction.reference),
                    status='SUCCESSFUL',
                    operator_reference=transaction.operator_reference,
                    operator_code=transaction.code,
                    signature=transaction.signature,
                    phone_number=transaction.phone_number,
                    app_amount=transaction.app_amount
                )
                logger.info(f"Payment created. Payment ID: {payment.id}")

                return {
                    'status': 'success',
                    'transaction_id': str(transaction.reference),
                    'subscription_id': subscription.id
                }

            except (User.DoesNotExist, SubscriptionPlan.DoesNotExist) as e:
                logger.error(f'Invalid user or plan: {str(e)}')
                transaction.status = 'FAILED'
                transaction.save()
                return {
                    'status': 'error',
                    'message': f'Invalid user or plan: {str(e)}'
                }

        logger.info(f"Payment status is not SUCCESSFUL. Status: {webhook_data.get('status')}")
        return {
            'status': 'pending',
            'transaction_id': str(transaction.reference)
        }

    except Exception as e:
        logger.exception(f"Error processing payment: {str(e)}")
        return {
            'status': 'error',
            'message': str(e)
        }

@shared_task
def retry_failed_payments():
    """
    Periodic task to retry failed payments
    """
    failed_transactions = Transaction.objects.filter(status='FAILED')
    results = []
    
    for transaction in failed_transactions:
        try:
            # Reconstruct webhook data from transaction
            webhook_data = {
                'reference': str(transaction.reference),
                'status': 'PENDING',  # Reset to pending for retry
                'amount': str(transaction.amount),
                'app_amount': str(transaction.app_amount),
                'currency': transaction.currency,
                'operator': transaction.operator,
                'endpoint': transaction.endpoint,
                'code': transaction.code,
                'operator_reference': transaction.operator_reference,
                'phone_number': transaction.phone_number,
                'signature': transaction.signature,
                'external_reference': transaction.external_reference
            }
            
            # Queue the payment processing task
            task_result = process_payment_task.delay(webhook_data)
            results.append({
                'transaction_id': str(transaction.reference),
                'task_id': task_result.id,
                'status': 'queued'
            })
            
        except Exception as e:
            results.append({
                'transaction_id': str(transaction.reference),
                'error': str(e),
                'status': 'failed'
            })
            print(f"Error retrying payment {transaction.reference}: {str(e)}")
            
    return {
        'retried_count': len(results),
        'results': results
    }
