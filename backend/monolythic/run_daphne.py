import os
import django
from daphne.cli import CommandLineInterface

def main():

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    cli = CommandLineInterface()
    cli.run(['-b', '0.0.0.0', '-p', '8001', 'backend.asgi:application'])

if __name__ == '__main__':
    main()