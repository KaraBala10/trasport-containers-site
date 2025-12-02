FROM nginx:alpine

# Install openssl for certificate generation and wget for healthchecks
RUN apk add --no-cache openssl wget

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 443

# Use entrypoint script to handle SSL certificates
ENTRYPOINT ["/docker-entrypoint.sh"]

