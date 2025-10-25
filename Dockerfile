# Dockerfile
FROM php:8.2-apache

# เปิด pdo_mysql
RUN docker-php-ext-install pdo pdo_mysql

# เปิด mod_rewrite (ถ้าต้องการ)
RUN a2enmod rewrite

# คัดลอกโค้ดเข้า DocumentRoot
WORKDIR /var/www/html
COPY . /var/www/html

# (ถ้ามี public/ และอยากให้เป็น web root)
# WORKDIR /var/www/html/public
# ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
# RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Apache listen 80; Railway จะ route ให้เอง
EXPOSE 80
