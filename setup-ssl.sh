#!/bin/bash
# Setup SSL with Certbot for medo-freight.eu

DOMAIN="medo-freight.eu"
EMAIL="contact@medo-freight.eu"

# 1. Install certbot
sudo apt update
sudo apt install -y certbot

# 2. Stop nginx temporarily (certbot needs port 80)
docker compose stop nginx

# 3. Generate SSL certificate using standalone mode
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d $DOMAIN \
  -d $DOMAIN \
  --email $EMAIL \
  --agree-tos \
  --non-interactive

# 4. Copy certificates to nginx volume location
mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./nginx/ssl/key.pem
sudo chmod 644 ./nginx/ssl/cert.pem
sudo chmod 600 ./nginx/ssl/key.pem

# 5. Update nginx config (already configured for HTTPS redirect)

# 6. Start nginx
docker compose up -d nginx

# 7. Setup auto-renewal
echo "0 0,12 * * * root certbot renew --quiet --deploy-hook 'docker compose exec -T nginx nginx -s reload'" | sudo tee -a /etc/cron.d/certbot-renew

echo "SSL setup complete! Visit https://$DOMAIN"

