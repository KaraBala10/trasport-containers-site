#!/bin/sh
set -e

# Create SSL directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Generate self-signed certificates if they don't exist
if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
    echo "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    chmod 600 /etc/nginx/ssl/key.pem
    chmod 644 /etc/nginx/ssl/cert.pem
    echo "Self-signed SSL certificates generated successfully."
fi

# Start nginx
exec nginx -g "daemon off;"

