FROM php:8.1-apache


COPY . /var/www/html/


RUN chown -R www-data:www-data /var/www/html/data && chmod -R 755 /var/www/html/data


RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf


CMD ["apache2-foreground"]
