import pika
import json
import os
import logging
from django.conf import settings
from .serializers import UserSerializer

# Configure logging
log_directory = 'logs'
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# File handler
file_handler = logging.FileHandler(os.path.join(log_directory, 'logs.txt'))
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler.setFormatter(file_formatter)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(levelname)s: %(message)s')
console_handler.setFormatter(console_formatter)

# Add handlers to logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

class UserEventPublisher:
    def __init__(self):
        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=settings.RABBITMQ_HOST,
                    port=settings.RABBITMQ_PORT,
                    credentials=pika.PlainCredentials(
                        settings.RABBITMQ_USERNAME,
                        settings.RABBITMQ_PASSWORD
                    )
                )
            )
            self.channel = self.connection.channel()
            self.exchange = 'user_exchange'
            self.channel.exchange_declare(exchange=self.exchange, exchange_type='topic', durable=True)
            logger.info("Successfully connected to RabbitMQ")
        except Exception as e:
            logger.error(f"Failed to initialize RabbitMQ connection: {e}")
            raise

    def publish(self, event_type, data, routing_key):
        try:
            message = {
                'event_type': event_type,
                'data': data
            }
            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key=routing_key,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    content_type='application/json',
                    delivery_mode=2
                )
            )
            logger.info(f"Published {event_type} event with routing key {routing_key}")
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            raise

    def publish_user_created(self, user):
        try:
            serializer = UserSerializer(user)
            self.publish('USER_CREATED', serializer.data, 'user.created')
            logger.info(f"User created event published for user: {user.email}")
        except Exception as e:
            logger.error(f"Error publishing user created event: {e}")
            raise

    def publish_user_updated(self, user):
        try:
            serializer = UserSerializer(user)
            self.publish('USER_UPDATED', serializer.data, 'user.updated')
            logger.info(f"User updated event published for user: {user.email}")
        except Exception as e:
            logger.error(f"Error publishing user updated event: {e}")
            raise

    def publish_user_deleted(self, user_id):
        try:
            data = {'id': str(user_id)}
            self.publish('USER_DELETED', data, 'user.deleted')
            logger.info(f"User deleted event published for user ID: {user_id}")
        except Exception as e:
            logger.error(f"Error publishing user deleted event: {e}")
            raise