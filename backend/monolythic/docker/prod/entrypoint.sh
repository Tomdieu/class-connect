#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

# Check if database restore is requested
if [ -f "/app/.restore_db" ]; then
  BACKUP_FILE=$(cat /app/.restore_db)
  echo "Database restore requested from backup: $BACKUP_FILE"
  if [ -f "/backups/$BACKUP_FILE" ]; then
    echo "Restoring database from $BACKUP_FILE"
    # Wait for PostgreSQL to become available
    until postgres_ready; do
      >&2 echo "Waiting for PostgreSQL to become available before restore.....:-("
      sleep 1
    done
    # Run restore script
    /app/docker/prod/restore-backup.sh "$BACKUP_FILE"
    # Remove restore flag
    rm /app/.restore_db
  else
    echo "Warning: Requested backup file not found: $BACKUP_FILE"
  fi
fi

# Rest of your existing entrypoint script
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