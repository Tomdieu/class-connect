# How to Use the Backup System

- Automatic Daily Backups: Backups will run automatically every day and are stored in the monolythic_postgres_backups volume.

- Manual Backup: If you need an immediate backup, run:
```sh
bash docker/prod/backup-now.sh
```
- View Available Backups:
```sh
docker exec classconnect_db_backup ls -la /backups
```
- Restore from a Backup:
```sh
bash execute-restore.sh <backup_filename>
```
This implementation provides a robust backup solution with:

- Daily automated backups
- Backup rotation (keeping 7 daily, 4 weekly, and 6 monthly backups)
- Persistent storage outside of containers
- Simple manual backup and restore procedures
- Integration with your existing database setup

The backups are kept in a named Docker volume that persists across container restarts and system reboots, ensuring you'll have access to your data even in case of catastrophic failures.