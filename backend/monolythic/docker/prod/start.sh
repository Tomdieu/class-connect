#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py collectstatic --no-input
python3 manage.py create_classes

daphne -b 0.0.0.0 -p 8001 backend.asgi:application
# gunicon backend.wsgi --bind 0.0.0.0:8001 --chdir=/app
