FROM php:8.2-apache


RUN a2dismod mpm_event || true

# Aktifkan prefork 
RUN a2enmod mpm_prefork

# Enable mod_rewrite 
RUN a2enmod rewrite



# Copy semua project ke Apache
COPY . /var/www/html

# Set permission 
RUN chown -R www-data:www-data /var/www/html

# Expose port untuk Railway
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
