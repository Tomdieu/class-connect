import os
import django
from daphne.cli import CommandLineInterface

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

if __name__ == '__main__':
    cli = CommandLineInterface()
    cli.run(['-b', '0.0.0.0', '-p', '8001', 'backend.asgi:application'])