import logging
from celery import shared_task
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth import get_user_model
import json
from ..models import Subscription, SubscriptionPlan, Transaction, Payment, PaymentReference

User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task
def process_payment_task(webhook_data):
    """
    Process payment webhook data asynchronously using PaymentReference model
    """
    try:
        logger.info(f"Starting process_payment_task with webhook_data: {webhook_data}")
        
        # Extract key information from webhook
        campay_reference = webhook_data.get('reference')
        external_reference = webhook_data.get('external_reference')
        status = webhook_data.get('status')
        operator = webhook_data.get('operator', '')
        
        if not external_reference:
            logger.error("Missing external_reference in webhook data")
            return {'status': 'error', 'message': 'Missing external_reference in webhook data'}
        
        # Find payment reference
        payment_ref = None
        try:
            logger.info(f"Looking up payment reference with external_reference: {external_reference}")
            payment_refs = PaymentReference.objects.filter(external_reference=external_reference)
            if payment_refs.exists():
                payment_ref = payment_refs.first()
                logger.info(f"Found PaymentReference for user {payment_ref.user}, plan {payment_ref.plan}")
        except Exception as e:
            logger.error(f"Error looking up payment reference: {e}")
        
        # Find transaction
        transaction = None
        try:
            transactions = Transaction.objects.filter(reference=external_reference)
            if transactions.exists():
                transaction = transactions.first()
                logger.info(f"Found transaction using reference={external_reference}")
        except Exception as e:
            logger.error(f"Error looking for transaction by reference: {e}")
        
        if not transaction and payment_ref:
            try:
                transactions = Transaction.objects.filter(
                    phone_number=payment_ref.phone_number,
                    amount=payment_ref.amount,
                    status='PENDING'
                ).order_by('-created_at')
                
                if transactions.exists():
                    transaction = transactions.first()
                    logger.info(f"Found transaction by phone/amount")
            except Exception as e:
                logger.error(f"Error finding transaction by phone/amount: {e}")
        
        if not transaction:
            logger.error(f"Transaction not found for external_reference={external_reference}")
            return {'status': 'error', 'message': f'Transaction with reference {external_reference} not found.'}
        
        # Update transaction status
        try:
            transaction.status = status
            transaction.code = webhook_data.get('code', '')
            transaction.operator = operator
            transaction.operator_reference = webhook_data.get('operator_reference', '')
            transaction.save()
            logger.info(f"Updated transaction with reference {transaction.reference} to status {status}")
        except Exception as e:
            logger.error(f"Error updating transaction: {e}")
            return {'status': 'error', 'message': f'Error updating transaction: {str(e)}'}
        
        # If payment was successful, create subscription and payment
        if status == 'SUCCESSFUL':
            try:
                # Determine user and plan
                if payment_ref:
                    user = payment_ref.user
                    plan = payment_ref.plan
                    amount = payment_ref.amount
                    logger.info(f"Using data from PaymentReference for user {user}, plan {plan}")
                else:
                    # Use cache data as fallback
                    cache_key = f"payment_ref_{external_reference}"
                    reference_data_json = cache.get(cache_key)
                    
                    if not reference_data_json:
                        logger.error("Reference data not found in cache")
                        return {'status': 'error', 'message': 'Reference data not found in cache'}
                    
                    reference_data = json.loads(reference_data_json)
                    user_id = reference_data.get('user_id')
                    plan_id = reference_data.get('plan_id')
                    amount = reference_data.get('amount')
                    
                    user = User.objects.get(id=user_id)
                    plan = SubscriptionPlan.objects.get(id=plan_id)
                    logger.info(f"Using data from cache")
                
                # Create subscription with only the fields we know exist
                subscription = Subscription.objects.create(
                    user=user,
                    plan=plan,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timezone.timedelta(days=plan.duration_days),
                    is_active=True,
                    # Remove status='ACTIVE' - it's a property, not a field
                )
                logger.info(f"Created subscription for user {user}")
                
                # Create payment with required subscription field
                try:
                    payment = Payment(
                        user=user,
                        amount=amount,
                        status='SUCCESSFUL',
                        payment_method=operator,
                        transaction_id=external_reference,
                        subscription=subscription  # Link to subscription
                    )
                    payment.save()
                    logger.info(f"Created payment with transaction_id: {external_reference}")
                except Exception as pe:
                    # If payment fails, delete the subscription
                    subscription.delete()
                    logger.error(f"Error creating payment: {pe}")
                    return {'status': 'error', 'message': f'Error creating payment: {str(pe)}'}
                
                return {
                    'status': 'success',
                    'message': 'Payment processed successfully',
                    'subscription_id': str(subscription.pk)
                }
                
            except Exception as e:
                logger.exception(f"Error creating subscription/payment: {str(e)}")
                return {'status': 'error', 'message': f'Error creating subscription/payment: {str(e)}'}
        
        return {
            'status': 'success',
            'message': f'Transaction updated with status: {status}',
            'transaction_reference': str(transaction.reference)
        }
            
    except Exception as e:
        logger.exception(f"Error processing payment: {str(e)}")
        return {'status': 'error', 'message': str(e)}

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
