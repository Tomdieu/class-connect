# Make sure the task is imported when the 'tasks' package is imported
from .process_payments import process_payment_task

__all__ = ['process_payment_task']
