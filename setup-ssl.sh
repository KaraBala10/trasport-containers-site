#!/bin/bash
# Setup SSL with Certbot for medo-freight.eu
# This script copies existing Let's Encrypt certificates to nginx/ssl directory

set -e

DOMAIN="medo-freight.eu"
EMAIL="contact@medo-freight.eu"
COMPOSE_FILE="docker-compose-prod.yml"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
NEEDS_NEW_CERT=false

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "This script must be run as root or with sudo"
    exit 1
fi

echo "Setting up SSL certificates for $DOMAIN..."

# 1. Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Certbot is not installed. Installing..."
    apt update
    apt install -y certbot
else
    echo "Certbot is already installed."
fi

# 2. Check if certificates already exist
if [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
    echo "Found existing Let's Encrypt certificates for $DOMAIN"
    
    # Check certificate expiration
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH/fullchain.pem" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y" "$EXPIRY_DATE" +%s 2>/dev/null)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
        echo "Warning: Certificate expires in $DAYS_UNTIL_EXPIRY days. Consider renewing."
    else
        echo "Certificate is valid for $DAYS_UNTIL_EXPIRY more days."
    fi
    
    NEEDS_NEW_CERT=false
else
    echo "No existing certificates found for $DOMAIN"
    NEEDS_NEW_CERT=true
fi

# 3. Generate new certificate if needed
if [ "$NEEDS_NEW_CERT" = true ]; then
    echo "Generating new Let's Encrypt certificate..."
    
    # Stop nginx temporarily (certbot needs port 80)
    echo "Stopping nginx container..."
    if [ -f "$COMPOSE_FILE" ]; then
        docker compose -f $COMPOSE_FILE stop nginx 2>/dev/null || docker compose stop nginx 2>/dev/null || true
    else
        docker compose stop nginx 2>/dev/null || true
    fi
    
    # Generate SSL certificate using standalone mode
    certbot certonly --standalone \
      --preferred-challenges http \
      -d $DOMAIN \
      --email $EMAIL \
      --agree-tos \
      --non-interactive
    
    echo "New certificate generated successfully."
else
    echo "Using existing certificates."
fi

# 4. Copy certificates to nginx volume location
echo "Copying certificates to nginx/ssl directory..."
mkdir -p ./nginx/ssl

if [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
    cp "$CERT_PATH/fullchain.pem" ./nginx/ssl/cert.pem
    cp "$CERT_PATH/privkey.pem" ./nginx/ssl/key.pem
    chmod 644 ./nginx/ssl/cert.pem
    chmod 600 ./nginx/ssl/key.pem
    
    # Set ownership to current user if not root
    if [ "$SUDO_USER" ]; then
        chown $SUDO_USER:$SUDO_USER ./nginx/ssl/cert.pem
        chown $SUDO_USER:$SUDO_USER ./nginx/ssl/key.pem
    fi
    
    echo "Certificates copied successfully."
else
    echo "ERROR: Certificate files not found at $CERT_PATH"
    exit 1
fi

# 5. Rebuild and restart nginx to use new certificates
echo "Rebuilding nginx container..."
if [ -f "$COMPOSE_FILE" ]; then
    docker compose -f $COMPOSE_FILE build nginx || docker compose build nginx
    docker compose -f $COMPOSE_FILE up -d nginx || docker compose up -d nginx
else
    docker compose build nginx
    docker compose up -d nginx
fi

# 6. Setup auto-renewal cron job
echo "Setting up certificate auto-renewal..."
RENEW_HOOK="docker compose -f $COMPOSE_FILE exec -T nginx nginx -s reload"
if [ ! -f "$COMPOSE_FILE" ]; then
    RENEW_HOOK="docker compose exec -T nginx nginx -s reload"
fi

# Get current directory for cron job
CURRENT_DIR=$(pwd)

# Remove old cron entry if exists
sed -i '/certbot renew.*medo-freight.eu/d' /etc/cron.d/certbot-renew 2>/dev/null || true

# Add new cron entry with certificate copy
CRON_ENTRY="0 0,12 * * * root certbot renew --quiet --deploy-hook '$RENEW_HOOK' && cp $CERT_PATH/fullchain.pem $CURRENT_DIR/nginx/ssl/cert.pem && cp $CERT_PATH/privkey.pem $CURRENT_DIR/nginx/ssl/key.pem && chmod 644 $CURRENT_DIR/nginx/ssl/cert.pem && chmod 600 $CURRENT_DIR/nginx/ssl/key.pem"

# Check if cron entry already exists
if ! grep -q "certbot renew.*medo-freight.eu" /etc/cron.d/certbot-renew 2>/dev/null; then
    echo "$CRON_ENTRY" | tee -a /etc/cron.d/certbot-renew
    chmod 644 /etc/cron.d/certbot-renew
    echo "Auto-renewal cron job added."
else
    echo "Auto-renewal cron job already exists."
fi

echo ""
echo "=========================================="
echo "SSL setup complete!"
echo "Certificates are now in ./nginx/ssl/"
echo "Visit https://$DOMAIN"
echo ""
echo "Certificates will auto-renew via cron job."
echo "=========================================="

