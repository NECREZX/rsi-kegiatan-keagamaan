FROM php:8.2-apache

RUN sed -i 's/80/${PORT}/g' /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf

COPY . /var/www/html/

RUN chmod -R 777 /var/www/html/data

EXPOSE 8080
