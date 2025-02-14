#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

# Wait for postgres to be ready
python << END
import sys
import psycopg2
import os
import time

suggest_unrecoverable_after = 30
start = time.time()

while True:
    try:
        psycopg2.connect(
            dbname=os.environ.get("POSTGRES_DB"),
            user=os.environ.get("POSTGRES_USER"),
            password=os.environ.get("POSTGRES_PASSWORD"),
            host="db",
            port="5432",
        )
        break
    except psycopg2.OperationalError as error:
        sys.stderr.write("Waiting for PostgreSQL to become available...\n")

        if time.time() - start > suggest_unrecoverable_after:
            sys.stderr.write("  This is taking longer than expected. The following exception may be indicative of an unrecoverable error: '{}'\n".format(error))

    time.sleep(1)
END

# Run migrations
python3 manage.py makemigrations users --no-input
python3 manage.py makemigrations --no-input
python3 manage.py migrate users --no-input
python3 manage.py migrate --no-input
python3 manage.py collectstatic --no-input
python3 manage.py create_classes

# Start server
#daphne -b 0.0.0.0 -p 8000 backend.asgi:application
gunicors backend.wsgi --bind 0.0.0.0:8001 --chdir=/app