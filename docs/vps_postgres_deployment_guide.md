# Complete VPS Deployment Guide with Direct PostgreSQL Installation

This guide walks you through deploying your Django application on a VPS with PostgreSQL installed directly on the server (not Docker) for optimal performance and scalability.

## Table of Contents
1. [VPS Preparation](#1-vps-preparation)
2. [PostgreSQL Installation & Setup](#2-postgresql-installation--setup)
3. [Database Configuration](#3-database-configuration)
4. [Environment Variables Setup](#4-environment-variables-setup)
5. [Modified Docker Compose](#5-modified-docker-compose)
6. [Automated Backup Setup](#6-automated-backup-setup)
7. [Security Configuration](#7-security-configuration)
8. [Deployment Commands](#8-deployment-commands)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. VPS Preparation

### Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common
```

### Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
exit
```

### Create Project Directory Structure
```bash
mkdir -p ~/apps/classconnect
mkdir -p ~/backups/postgres
mkdir -p ~/scripts
cd ~/apps/classconnect
```

---

## 2. PostgreSQL Installation & Setup

### Install PostgreSQL
```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### Secure PostgreSQL Installation
```bash
# Set password for postgres user
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_postgres_admin_password';"

# Exit PostgreSQL
sudo -u postgres psql -c "\q"
```

---

## 3. Database Configuration

### Create Database and User
```bash
# Connect as postgres user
sudo -u postgres psql

# Execute these commands in PostgreSQL shell:
```

```sql
-- Create database
CREATE DATABASE classconnect_db;

-- Create user with secure password
CREATE USER classconnect_user WITH ENCRYPTED PASSWORD 'your_secure_app_password';

-- Grant privilegesyour_secure_app_password
GRANT ALL PRIVILEGES ON DATABASE classconnect_db TO classconnect_user;
ALTER USER classconnect_user CREATEDB;

-- Grant schema privileges
\c classconnect_db
GRANT ALL ON SCHEMA public TO classconnect_user;

-- Exit
\q
```

### Configure PostgreSQL for Performance
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Add/modify these settings based on your VPS specs:

```ini
# Memory settings (adjust based on your VPS RAM)
shared_buffers = 256MB          # 25% of RAM for 1GB VPS
work_mem = 4MB                  # Per connection work memory
maintenance_work_mem = 64MB     # For maintenance operations

# Connection settings
max_connections = 200           # Adjust based on expected load

# Write-ahead logging
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query planner settings
effective_cache_size = 750MB    # 75% of RAM for 1GB VPS

# Logging (for monitoring)
log_statement = 'all'
log_min_duration_statement = 1000  # Log slow queries (>1s)
```

### Configure PostgreSQL Access
```bash
# Edit pg_hba.conf for local connections
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Ensure these lines exist:
```ini
# Local connections
local   all             postgres                                peer
local   all             classconnect_user                       md5

# IPv4 local connections
host    all             classconnect_user       127.0.0.1/32    md5
host    all             classconnect_user       localhost       md5
```

### Restart PostgreSQL
```bash
sudo systemctl restart postgresql

# Test connection
psql -h localhost -U classconnect_user -d classconnect_db -c "SELECT version();"
```

---

## 4. Environment Variables Setup

### Create Environment Files Directory
```bash
mkdir -p .envs/.prod
```

### Django Environment File
Create `.envs/.prod/django`:
```bash
# Database Configuration
POSTGRES_DB=classconnect_db
POSTGRES_USER=classconnect_user
POSTGRES_PASSWORD=your_secure_app_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Django Settings
DEBUG=False
SECRET_KEY=your_very_long_secret_key_here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your.vps.ip.address

# Additional Django settings
DJANGO_SETTINGS_MODULE=backend.settings.production
```

### PostgreSQL Environment File (for backup service if using Docker backup)
Create `.envs/.prod/postgres`:
```bash
POSTGRES_DB=classconnect_db
POSTGRES_USER=classconnect_user
POSTGRES_PASSWORD=your_secure_app_password
```

### RabbitMQ Environment File
Create `.envs/.prod/rabbitmq`:
```bash
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=your_rabbitmq_password
```

### Backblaze Environment File
Create `.envs/.prod/backblaze`:
```bash
# Your Backblaze B2 settings
BACKBLAZE_BUCKET_NAME=your-bucket-name
BACKBLAZE_KEY_ID=your-key-id
BACKBLAZE_APPLICATION_KEY=your-application-key
```

---

## 5. Modified Docker Compose

Create your `docker-compose.yml` (without PostgreSQL service):

```yaml
networks:
  e_learning_network:
    driver: bridge

services:
  api:
    build:
      context: .
      dockerfile: ./docker/prod/Dockerfile
    command: /start.sh
    container_name: classconnect_api
    restart: unless-stopped
    volumes:
      - .:/app
      - monolythic_static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    env_file:
      - .envs/.prod/django
      - .envs/.prod/backblaze
    depends_on:
      - rabbitmq
      - redis
    networks:
      - e_learning_network

  rabbitmq:
    image: rabbitmq:3.10-management-alpine
    hostname: rabbitmq
    container_name: classconnect_rabbitmq
    restart: unless-stopped
    ports:
      - "5672:5672"
      - "15672:15672"
    env_file:
      - .envs/.prod/rabbitmq
    volumes:
      - monolythic_rabbitmq_data:/var/lib/rabbitmq
    networks:
      - e_learning_network

  redis:
    image: redis:7.4
    container_name: classconnect_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - monolythic_redis_data:/data
    networks:
      - e_learning_network

  celery_worker:
    build:
      context: .
      dockerfile: ./docker/prod/Dockerfile
    container_name: classconnect_celery_worker
    command: celery -A backend worker --loglevel=info
    restart: unless-stopped
    env_file:
      - .envs/.prod/django
    depends_on:
      - api
      - rabbitmq
      - redis
    entrypoint: /entrypoint.sh
    volumes:
      - .:/app
    networks:
      - e_learning_network

  celery_beat:
    build:
      context: .
      dockerfile: ./docker/prod/Dockerfile
    container_name: classconnect_celery_beat
    command: celery -A backend beat --loglevel=info
    restart: unless-stopped
    env_file:
      - .envs/.prod/django
    depends_on:
      - api
      - celery_worker
      - rabbitmq
      - redis
    entrypoint: /entrypoint.sh
    volumes:
      - .:/app
    networks:
      - e_learning_network

volumes:
  monolythic_rabbitmq_data:
    labels:
      - "keep=true"
  monolythic_static_volume:
    labels:
      - "keep=true"
  monolythic_redis_data:
    labels:
      - "keep=true"
```


Get the network ip ``
```
docker network inspect monolythic_e_learning_network \
  --format='{{(index .IPAM.Config 0).Gateway}}'
```

update the postgres to accept the Gateway ip

---

## 6. Automated Backup Setup

### Create Backup Script
Create `~/scripts/backup_postgres.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="classconnect_db"
DB_USER="classconnect_user"
DB_HOST="localhost"
BACKUP_DIR="/home/$(whoami)/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

# Start backup process
log_message "Starting PostgreSQL backup for $DB_NAME"

# Set password from environment or prompt
export PGPASSWORD="your_secure_app_password"

# Create compressed backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/backup_${DATE}.sql.gz

# Check if backup was successful
if [ $? -eq 0 ]; then
    log_message "Backup completed successfully: backup_${DATE}.sql.gz"
    
    # Get backup size
    BACKUP_SIZE=$(du -h $BACKUP_DIR/backup_${DATE}.sql.gz | cut -f1)
    log_message "Backup size: $BACKUP_SIZE"
    
    # Clean up old backups (keep last 7 days)
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -exec rm {} \;
    log_message "Cleaned up backups older than 7 days"
    
    # Optional: Upload to remote storage (uncomment if needed)
    # rsync -avz $BACKUP_DIR/backup_${DATE}.sql.gz user@remote-server:/path/to/backups/
    
else
    log_message "ERROR: Backup failed!"
    exit 1
fi

# Unset password
unset PGPASSWORD

log_message "Backup process completed"
```

### Make Script Executable
```bash
chmod +x ~/scripts/backup_postgres.sh

# Test the backup script
~/scripts/backup_postgres.sh
```

### Setup Cron Job for Automated Backups
```bash
# Edit crontab
crontab -e

# Add these lines for automated backups:
# Daily backup at 2 AM
0 2 * * * /home/$(whoami)/scripts/backup_postgres.sh

# Weekly full backup on Sunday at 3 AM
0 3 * * 0 /home/$(whoami)/scripts/backup_postgres.sh

# Monthly backup on the 1st at 4 AM
0 4 1 * * /home/$(whoami)/scripts/backup_postgres.sh
```

### Create Backup Restore Script
Create `~/scripts/restore_postgres.sh`:

```bash
#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ~/backups/postgres/backup_*.sql.gz
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="classconnect_db"
DB_USER="classconnect_user"

echo "Restoring from: $BACKUP_FILE"
echo "WARNING: This will drop and recreate the database!"
read -p "Are you sure? (yes/no): " confirmation

if [ "$confirmation" = "yes" ]; then
    export PGPASSWORD="your_secure_app_password"
    
    # Drop and recreate database
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
    
    # Restore from backup
    gunzip -c $BACKUP_FILE | psql -h localhost -U $DB_USER -d $DB_NAME
    
    echo "Database restored successfully!"
    unset PGPASSWORD
else
    echo "Restore cancelled."
fi
```

```bash
chmod +x ~/scripts/restore_postgres.sh
```

---

## 7. Security Configuration

### Configure UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow your application port
sudo ufw allow 8000

# Allow PostgreSQL only from localhost (more secure)
sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status
```

### Secure PostgreSQL
```bash
# Edit postgresql.conf to listen only on localhost
sudo nano /etc/postgresql/16/main/postgresql.conf
```

Ensure:
```ini
listen_addresses = 'localhost'
port = 5432
```

### Set up SSL/TLS (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

---

## 8. Deployment Commands

### Clone Your Repository
```bash
cd ~/apps/classconnect
git clone https://github.com/yourusername/your-repo.git .

# Or if already cloned
git pull origin main
```

### Build and Start Services
```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Run Django Migrations
```bash
# Execute migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# Collect static files
docker-compose exec api python manage.py collectstatic --noinput
```

---

## 9. Monitoring & Maintenance

### Create System Monitoring Script
Create `~/scripts/system_monitor.sh`:

```bash
#!/bin/bash

LOG_FILE="/home/$(whoami)/logs/system_monitor.log"
mkdir -p /home/$(whoami)/logs

echo "=== System Monitor Report - $(date) ===" >> $LOG_FILE

# System resources
echo "--- System Resources ---" >> $LOG_FILE
free -h >> $LOG_FILE
df -h >> $LOG_FILE

# PostgreSQL status
echo "--- PostgreSQL Status ---" >> $LOG_FILE
sudo systemctl status postgresql --no-pager >> $LOG_FILE

# Docker containers status
echo "--- Docker Containers ---" >> $LOG_FILE
docker ps >> $LOG_FILE

# PostgreSQL connections
echo "--- Active Database Connections ---" >> $LOG_FILE
sudo -u postgres psql -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active';" >> $LOG_FILE

echo "===========================================" >> $LOG_FILE
```

### Set up Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/classconnect
```

```ini
/home/*/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644
}
```

### Health Check Script
Create `~/scripts/health_check.sh`:

```bash
#!/bin/bash

# Check PostgreSQL
pg_isready -h localhost -U classconnect_user -d classconnect_db
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL is healthy"
else
    echo "❌ PostgreSQL is down"
fi

# Check Docker services
docker-compose ps

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️  Disk usage is ${DISK_USAGE}% - Consider cleanup"
else
    echo "✅ Disk usage is ${DISK_USAGE}%"
fi
```

---

## 10. Troubleshooting

### Common Issues and Solutions

#### PostgreSQL Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Test connection
psql -h localhost -U classconnect_user -d classconnect_db -c "SELECT 1;"
```

#### Docker Container Issues
```bash
# View container logs
docker-compose logs api
docker-compose logs celery_worker

# Restart specific service
docker-compose restart api

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

#### Performance Issues
```bash
# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check slow queries
sudo tail -f /var/log/postgresql/postgresql-14-main.log | grep "duration:"

# Monitor system resources
htop
iotop
```

### Useful Commands

```bash
# PostgreSQL database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('classconnect_db'));"

# List all databases
sudo -u postgres psql -l

# Restart all services
docker-compose restart

# View backup files
ls -la ~/backups/postgres/

# Manual backup
~/scripts/backup_postgres.sh

# Check service ports
netstat -tulpn | grep -E ':(5432|8000|5672|6379|15672)'
```

### Emergency Recovery

If something goes wrong:

```bash
# Stop all services
docker-compose down

# Restart PostgreSQL
sudo systemctl restart postgresql

# Restore from backup
~/scripts/restore_postgres.sh ~/backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz

# Start services again
docker-compose up -d
```

---

## Conclusion

This setup provides:
- ✅ High-performance PostgreSQL installation
- ✅ Automated daily backups with retention
- ✅ Secure configuration
- ✅ Monitoring and maintenance scripts
- ✅ Easy troubleshooting commands

Your application should now be ready for production with PostgreSQL running directly on the VPS for optimal performance!