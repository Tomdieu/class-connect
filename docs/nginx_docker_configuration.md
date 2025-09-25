# Complete Nginx Configuration for ClassConnect Docker Setup

This guide configures Nginx as a reverse proxy for your Docker Compose applications with SSL certificates.

## Domain Configuration
- **Frontend**: `https://classconnect.cm/` (port 3000)
- **Backend API**: `https://www.api.classconnect.cm/` (port 8000)
- **www redirects**: `https://www.classconnect.cm/` → `https://classconnect.cm/`

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Nginx Installation](#2-nginx-installation)
3. [SSL Certificate Setup](#3-ssl-certificate-setup)
4. [Nginx Configuration](#4-nginx-configuration)
5. [Docker Network Configuration](#5-docker-network-configuration)
6. [Security Enhancements](#6-security-enhancements)
7. [Testing and Deployment](#7-testing-and-deployment)
8. [Maintenance and Monitoring](#8-maintenance-and-monitoring)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### DNS Configuration
Ensure your domains point to your VPS:
```bash
# Check DNS resolution
nslookup classconnect.cm
nslookup www.classconnect.cm
nslookup api.classconnect.cm
nslookup www.api.classconnect.cm
```

### Required Ports
```bash
# Open required ports in firewall
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 22    # SSH
sudo ufw status
```

---

## 2. Nginx Installation

### Install Nginx
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Remove Default Configuration
```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
```

---

## 3. SSL Certificate Setup

### Install Certbot
```bash
# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

### Stop Nginx Temporarily
```bash
sudo systemctl stop nginx
```

### Generate SSL Certificates
```bash
# Generate certificates for all domains
sudo certbot certonly --standalone \
  -d classconnect.cm \
  -d www.classconnect.cm \
  -d www.meet.classconnect.cm \
  -d meet.classconnect.cm \
  -d rabbitmq.classconnect.cm \
  -d www.meet.classconnect.cm \
  -d meet.classconnect.cm \
  -d api.classconnect.cm \
  -d www.api.classconnect.cm \
  --email ivan.tomdieu@gmail.com \
  --agree-tos \
  --no-eff-email

# Certificates will be stored at:
# /etc/letsencrypt/live/classconnect.cm/
```

### Setup Auto-Renewal
```bash
# Add cron job for certificate renewal
sudo crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /usr/bin/certbot renew --quiet --reload-hook "systemctl reload nginx"
```

---

## 4. Nginx Configuration

### Main Nginx Configuration
Edit `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 1024;
	multi_accept on;
	use epoll;
}

http {

	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	tcp_nodelay on;
	keepalive_timeout 65;
	types_hash_max_size 2048;
	server_tokens off;

	# File Upload Settings
        client_max_body_size 4G;
        client_body_buffer_size 128k;
        client_header_buffer_size 3m;
        large_client_header_buffers 4 256k;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers off;
	ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_session_cache shared:SSL:50m;
        ssl_session_timeout 1d;
        ssl_session_tickets off;
	

	##
	# Logging Settings
	##

	# Rate limiting zones
	limit_req_zone $binary_remote_addr zone=frontend:10m rate=20r/s;
	limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
	# Log format definition
	log_format main '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" "$http_x_forwarded_for"';
	access_log /var/log/nginx/access.log;

	##
	# Gzip Settings
	##

	gzip on;

	gzip_vary on;
	gzip_proxied any;
	gzip_comp_level 6;
	gzip_min_length 256;
	gzip_disable "msie6";
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	 gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/atom+xml image/svg+xml;

	# OCSP Stapling
        ssl_stapling on;
        ssl_stapling_verify on; 

	##
	# Virtual Host Configs
	##

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}
```

### Frontend Configuration
Create `/etc/nginx/sites-available/classconnect-frontend`:

```nginx
# Frontend Configuration - classconnect.cm
upstream frontend_upstream {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Redirect www.classconnect.cm to classconnect.cm
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.classconnect.cm classconnect.cm;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/classconnect.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/classconnect.cm/privkey.pem;
    
    # Redirect to non-www
    return 301 https://classconnect.cm$request_uri;
}

# HTTP to HTTPS redirect for main domain
server {
    listen 80;
    server_name classconnect.cm;
    
    # Certbot challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main Frontend Server - HTTPS
server {
    listen 443 ssl http2;
    server_name classconnect.cm;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/classconnect.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/classconnect.cm/privkey.pem;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.api.classconnect.cm;" always;
    
    # Rate Limiting
    limit_req zone=frontend burst=20 nodelay;
    
    # Logging
    access_log /var/log/nginx/frontend_access.log main;
    error_log /var/log/nginx/frontend_error.log;
    
    # Main location - proxy to React app
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Handle React Router
        try_files $uri $uri/ @fallback;
    }
    
    # Fallback for React Router (SPA)
    location @fallback {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend_upstream;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
        expires 30d;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Backend API Configuration
Create `/etc/nginx/sites-available/classconnect-api`:

```nginx
# Frontend Configuration - classconnect.cm
upstream frontend_upstream {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Redirect www.classconnect.cm to classconnect.cm (HTTPS only)
server {
    listen 443 ssl http2;
    server_name www.classconnect.cm;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/classconnect.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/classconnect.cm/privkey.pem;
    
    # Redirect to non-www
    return 301 https://classconnect.cm$request_uri;
}

# HTTP to HTTPS redirect for all domains
server {
    listen 80;
    server_name classconnect.cm www.classconnect.cm;
    
    # Certbot challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://classconnect.cm$request_uri;
    }
}

# Main Frontend Server - HTTPS
server {
    listen 443 ssl http2;
    server_name classconnect.cm;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/classconnect.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/classconnect.cm/privkey.pem;
    
    
    
    # Logging
    access_log /var/log/nginx/frontend_access.log main;
    error_log /var/log/nginx/frontend_error.log;
    
    # Main location - proxy to React app
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Static files optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend_upstream;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, immutable";
        expires 30d;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

```

### JITSI MEET CONFIGURATION

```
server {
    listen 80;
    listen [::]:80;
    server_name meet.classconnect.cm;

    # For Let's Encrypt challenge
    location ^~ /.well-known/acme-challenge/ {
        proxy_pass http://127.0.0.1:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Redirect all other HTTP requests to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name meet.classconnect.cm;

    # Use existing Let's Encrypt certificate if available
    ssl_certificate /etc/letsencrypt/live/classconnect.cm/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/classconnect.cm/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;


    # Proxy configuration - Use HTTP to avoid SSL issues with Jitsi container
    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        # Important for Jitsi WebSocket connections
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Increase proxy timeouts for long-lived connections
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Specific handling for WebSocket connections
    location ~ ^/(colibri-ws|xmpp-websocket) {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        # WebSocket specific settings
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        tcp_nodelay on;
    }

    # Logging
    access_log /var/log/nginx/meet.classconnect.cm.access.log;
    error_log /var/log/nginx/meet.classconnect.cm.error.log;
}

```


### Enable Site Configurations
```bash
# Create symbolic links to enable sites
sudo ln -s /etc/nginx/sites-available/classconnect-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/classconnect-api /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 5. Docker Network Configuration

### Update Docker Compose Files

#### Backend Docker Compose
Update your backend `docker-compose.yml`:

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
      - "127.0.0.1:8000:8000"  # Bind only to localhost
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
      - "127.0.0.1:5672:5672"    # Bind only to localhost
      - "127.0.0.1:15672:15672"  # Management interface
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
      - "127.0.0.1:6379:6379"  # Bind only to localhost
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

#### Frontend Docker Compose  
Update your frontend `docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: ./Dockerfile
    container_name: classconnect_frontend
    ports:
      - "127.0.0.1:3000:3000"  # Bind only to localhost
    restart: unless-stopped
    env_file:
      - ./.env
```

### Update Django Settings
Add to your Django settings to handle the proxy:

```python
# In your Django settings
ALLOWED_HOSTS = [
    'www.api.classconnect.cm',
    'api.classconnect.cm',
    'localhost',
    '127.0.0.1',
]

# Trust proxy headers from Nginx
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://classconnect.cm",
    "https://www.classconnect.cm",  # In case someone accesses it
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 6. Security Enhancements

### Create Security Configuration
Create `/etc/nginx/conf.d/security.conf`:

```nginx
# Security Configuration
# Hide Nginx version

# Prevent clickjacking
add_header X-Frame-Options DENY always;

# Prevent content-type sniffing
add_header X-Content-Type-Options nosniff always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

### Fail2Ban for Additional Protecti