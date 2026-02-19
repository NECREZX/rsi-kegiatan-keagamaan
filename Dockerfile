FROM php:8.1-cli


RUN apt-get update && apt-get install -y libzip-dev zip \
    && docker-php-ext-install zip


COPY . /usr/src/myapp
WORKDIR /usr/src/myapp


RUN mkdir -p data && chown -R www-data:www-data data && chmod -R 775 data


CMD ["sh", "-c", "php -S 0.0.0.0:${PORT}"]
