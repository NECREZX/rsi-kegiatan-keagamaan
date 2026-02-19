FROM php:8.1-apache

# 1. Install ekstensi yang mungkin dibutuhkan untuk manipulasi Excel/JSON
RUN apt-get update && apt-get install -y libzip-dev zip \
    && docker-php-ext-install zip

# 2. Salin project
COPY . /var/www/html/

# 3. FIX MPM ERROR: Pastikan hanya satu MPM yang jalan
RUN a2dismod mpm_event && a2enmod mpm_prefork

# 4. FIX PERMISSION: Supaya bisa nulis ke database.json & database.xlsx
RUN chown -R www-data:www-data /var/www/html/data \
    && chmod -R 775 /var/www/html/data

# 5. FIX PORT: Wajib supaya tidak "Application failed to respond"
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# 6. Jalankan
CMD ["apache2-foreground"]
