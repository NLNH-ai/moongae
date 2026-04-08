# Initial Server Setup

These commands assume Ubuntu 24.04 or Debian 12 and a deployment root at `/var/www/company-website`.

## 1. Install base packages

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk nginx mysql-server certbot python3-certbot-nginx curl git rsync
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## 2. Create directories and permissions

```bash
sudo mkdir -p /var/www/company-website /var/www/company-website/dist /var/www/company-website/run /var/www/company-website/logs
sudo mkdir -p /var/www/uploads /etc/company-website
sudo chown -R "$USER":www-data /var/www/company-website /var/www/uploads
sudo chmod -R 775 /var/www/company-website /var/www/uploads
sudo chmod 750 /etc/company-website
```

## 3. Clone the project

```bash
cd /var/www
git clone https://github.com/OWNER/REPO.git company-website
cd /var/www/company-website
```

## 4. Create MySQL database and user

```sql
CREATE DATABASE company_website CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'company_user'@'localhost' IDENTIFIED BY 'change-this-password';
GRANT ALL PRIVILEGES ON company_website.* TO 'company_user'@'localhost';
FLUSH PRIVILEGES;
```

Run the SQL with:

```bash
sudo mysql
```

Then copy the environment file:

```bash
sudo cp /var/www/company-website/infra/.env.template /etc/company-website/env
sudo nano /etc/company-website/env
sudo chmod 640 /etc/company-website/env
```

At minimum set:

```dotenv
DB_PASSWORD=change-this-password
JWT_SECRET=replace-with-a-long-random-secret
UPLOAD_DIR=/var/www/uploads
DB_USERNAME=company_user
```

## 5. Install systemd service

```bash
sudo cp /var/www/company-website/infra/company-website.service /etc/systemd/system/company-website.service
sudo systemctl daemon-reload
sudo systemctl enable company-website
```

## 6. Install and enable Nginx site

Generate a domain-specific config first.

```bash
pwsh /var/www/company-website/infra/configure-domain.ps1 -Domain example.com
sudo cp /var/www/company-website/infra/nginx/company-website.generated.conf /etc/nginx/sites-available/company-website
sudo ln -sf /etc/nginx/sites-available/company-website /etc/nginx/sites-enabled/company-website
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Issue a Let's Encrypt certificate

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

## 8. Configure the firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 9. Run the first deployment

```bash
cd /var/www/company-website
chmod +x infra/deploy.sh
./infra/deploy.sh
```

## 10. Useful operations

```bash
sudo systemctl status company-website
sudo journalctl -u company-website -f
tail -f /var/www/company-website/logs/application.log
curl http://127.0.0.1:8080/api/health
```
