FROM php:8.1-apache


RUN a2dismod mpm_event || true
RUN a2enmod mpm_prefork || true


COPY . /var/www/html/


RUN mkdir -p /var/www/html/data \
    && chown -R www-data:www-data /var/www/html/data \
    && chmod -R 775 /var/www/html/data


RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf


RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

WORKDIR /var/www/html

CMD ["apache2-foreground"]
