FROM php:8.2-apache


RUN rm -f /etc/apache2/mods-enabled/mpm_*

# Aktifkan hanya prefork
RUN a2enmod mpm_prefork

# Enable rewrite 
RUN a2enmod rewrite

# Copy project
COPY . /var/www/html

# Set permission
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
