FROM php:8.1-apache


COPY . /var/www/html/


RUN mkdir -p /var/www/html/data \
    && chown -R www-data:www-data /var/www/html/data \
    && chmod -R 775 /var/www/html/data


RUN rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*


RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf


ENTRYPOINT ["/bin/sh", "-c", "ln -sf /etc/apache2/mods-available/mpm_prefork.* /etc/apache2/mods-enabled/ && apache2-foreground"]
