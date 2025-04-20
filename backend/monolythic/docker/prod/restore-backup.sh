#!/bin/bash
set -e

# This script restores a PostgreSQL database backup
# Usage: ./restore-backup.sh [backup_filename]

# Check if a backup filename was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_filename>"
    echo "Available backups:"
    ls -la /backups
    exit 1
fi

BACKUP_FILE="/backups/$1"

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found."
    echo "Available backups:"
    ls -la /backups
    exit 1
fi

echo "Restoring database from backup: $BACKUP_FILE"

# Make sure the PostgreSQL environment variables are set
if [ -z "$POSTGRES_DB" ] || [ -z "$POSTGRES_USER" ]; then
    echo "Error: PostgreSQL environment variables not set."
    echo "Required: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD"
    exit 1
fi

# Drop existing connections to the database
echo "Dropping existing connections to database '$POSTGRES_DB'..."
psql -h db -U $POSTGRES_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();"

# Drop and recreate the database
echo "Dropping and recreating database '$POSTGRES_DB'..."
psql -h db -U $POSTGRES_USER -d postgres -c "DROP DATABASE IF EXISTS $POSTGRES_DB;"
psql -h db -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $POSTGRES_DB;"

# Restore the backup
echo "Restoring backup data to '$POSTGRES_DB'..."
gunzip -c "$BACKUP_FILE" | psql -h db -U $POSTGRES_USER -d $POSTGRES_DB

echo "Backup restoration completed successfully!"

# Optionally: restart dependent services
echo "You may want to restart dependent services now"
echo "Command: docker compose restart api celery_worker celery_beat"
