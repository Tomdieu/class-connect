# Cheats

Create a new NGINX configuration file for your Next.js application.

Installing PM2 (Process Manager):

```bash
sudo npm install pm2 -g
pm2 start npm --name "my-next-app" -- start
pm2 startup
```

sudo nano /etc/nginx/sites-available/my-next-app

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
``` 
 The above configuration file listens on port 80 and proxies requests to your Next.js application running on port 3000. Replace `example.com` with your domain name.

Enable the site and restart NGINX.

```bash
sudo ln -s /etc/nginx/sites-available/my-next-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Enabling HTTPS and Obtaining SSL Certificate:

```bash
sudo apt-get install certbot python3-certbot-nginx // Install Certbot
sudo ufw allow 'Nginx Full' // Allow HTTPS traffic
sudo certbot --nginx -d your-domain.com -d www.your-domain.com // Obtain SSL certificate
sudo certbot renew --dry-run // Test automatic certificate renewal
``` 
 The above commands install Certbot, allow HTTPS traffic, obtain an SSL certificate for your domain, and test automatic certificate renewal.