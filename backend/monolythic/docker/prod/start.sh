#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

python3 manage.py makemigrations --no-input
python3 manage.py migrate --no-input
python3 manage.py collectstatic --no-input
python3 manage.py create_classes
python3 manage.py create_admin_users
python3 manage.py create_public_forum
python3 manage.py create_subscription_plans
python3 manage.py generate_school_year

python3 run_daphne.py
# daphne -b 0.0.0.0 -p 8001 backend.asgi:application
# gunicon backend.wsgi --bind 0.0.0.0:8001 --chdir=/app
