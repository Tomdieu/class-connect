#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

postgres_ready() {
python << END
import sys
import psycopg2
try:
   psycopg2.connect(
      dbname="${POSTGRES_DB}",
      user="${POSTGRES_USER}",
      password="${POSTGRES_PASSWORD}",
      host="${POSTGRES_HOST}",
      port="${POSTGRES_PORT}",
   )
except psycopg2.OperationalError:
   sys.exit(-1)
sys.exit(0)
END
}
until postgres_ready; do
>&2 echo "Waiting for PostgreSQL to become available.....:-("
sleep 1
done
>&2 echo "PostgreSQL is ready!!!!.....:-)"

# Check if migrations are complete by verifying if django_celery_beat_periodictask table exists
migrations_complete() {
python << END
import sys
import psycopg2
try:
   conn = psycopg2.connect(
      dbname="${POSTGRES_DB}",
      user="${POSTGRES_USER}",
      password="${POSTGRES_PASSWORD}",
      host="${POSTGRES_HOST}",
      port="${POSTGRES_PORT}",
   )
   cursor = conn.cursor()
   cursor.execute("SELECT to_regclass('public.django_celery_beat_periodictask');")
   result = cursor.fetchone()[0]
   if result is None:
      sys.exit(-1)
except Exception:
   sys.exit(-1)
sys.exit(0)
END
}

# For Celery Beat, wait until migrations are complete
if [[ "$@" == *"celery -A backend beat"* ]]; then
  until migrations_complete; do
    >&2 echo "Waiting for Django migrations to be applied......"
    sleep 3
  done
  >&2 echo "Migrations are complete! Starting Celery Beat......"
fi

exec "$@"