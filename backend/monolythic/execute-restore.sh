#!/bin/bash
set -e

# This script assists with restoring the database from a backup

# Check if a backup filename was provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_filename>"
    echo "Listing available backups:"
    docker exec classconnect_db_backup ls -la /backups
    exit 1
fi

BACKUP_FILE="$1"

# Check if the backup container is running
if ! docker ps | grep -q classconnect_db_backup; then
    echo "Error: Backup container is not running."
    exit 1
fi

# Check if the backup file exists
if ! docker exec classconnect_db_backup test -f "/backups/$BACKUP_FILE"; then
    echo "Error: Backup file '$BACKUP_FILE' not found in the backup container."
    echo "Available backups:"
    docker exec classconnect_db_backup ls -la /backups
    exit 1
fi

echo "Starting database restoration from backup: $BACKUP_FILE"

# Create a temporary container to run the restore
docker compose -f prod.yml run --rm -v monolythic_postgres_backups:/backups db-restore \
    bash -c "/app/docker/prod/restore-backup.sh $BACKUP_FILE"

echo "Database restoration completed successfully!"
echo "You may want to restart your application services with: docker compose restart api celery_worker celery_beat"
