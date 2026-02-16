#!/bin/sh
set -e

cd /var/www/backend

# Install dependencies if vendor directory doesn't exist
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --no-progress --prefer-dist
fi

# Generate app key if not set
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:placeholder" ]; then
    if [ -f ".env" ]; then
        php artisan key:generate --force
    fi
fi

# Run migrations
php artisan migrate --force 2>/dev/null || true

# Clear and cache config
php artisan config:clear
php artisan route:clear

exec "$@"
