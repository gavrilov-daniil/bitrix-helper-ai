#!/bin/sh
set -e

cd /var/www/backend

# Install dependencies if vendor directory doesn't exist
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --no-progress --prefer-dist
fi

# Ensure storage and cache directories exist
mkdir -p bootstrap/cache storage/framework/{sessions,views,cache} storage/logs
chmod -R 777 bootstrap/cache storage 2>/dev/null || true

# Generate app key if not set in .env
if grep -q "^APP_KEY=$" .env 2>/dev/null; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force 2>/dev/null || true

# Seed admin user
php artisan db:seed --class='Database\Seeders\AdminUserSeeder' --force 2>/dev/null || true

# Clear and cache config
php artisan config:clear
php artisan route:clear

exec "$@"
