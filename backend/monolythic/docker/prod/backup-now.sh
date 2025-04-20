#!/bin/bash
set -e

# This script triggers an immediate backup of the PostgreSQL database
# It connects to the backup container and executes the backup script

echo "Starting manual PostgreSQL database backup..."

# Execute the backup script inside the backup container
docker exec classconnect_db_backup /backup.sh

echo "Manual backup completed successfully!"
echo "Backups are stored in the 'monolythic_postgres_backups' volume"
echo "To list available backups, run: docker exec classconnect_db_backup ls -la /backups"
