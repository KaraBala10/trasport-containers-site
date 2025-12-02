#!/bin/sh
set -e

# Create SSL directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Only generate self-signed certificates if they don't exist AND we're not in production
# Production should use Let's Encrypt certificates mounted from ./nginx/ssl volume
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    # Check if we're in production (certificates should be mounted)
    # If certificates are missing in production, this is an error
    if [ -n "$PRODUCTION" ] || [ -n "$LETSENCRYPT" ]; then
        echo "ERROR: SSL certificates not found in production mode!"
        echo "Please run setup-ssl.sh to generate Let's Encrypt certificates."
        echo "Or mount certificates to ./nginx/ssl/ directory."
        exit 1
    fi
    
    # Development: Generate self-signed certificates for localhost
    echo "Generating self-signed SSL certificates for development (localhost)..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    echo "Self-signed SSL certificates generated successfully for localhost."
else
    echo "Using existing SSL certificates from mounted volume."
fi

# Start nginx
exec nginx -g "daemon off;"

