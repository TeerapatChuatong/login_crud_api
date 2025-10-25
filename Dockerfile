FROM php:8.2-apache

# ติดตั้งส่วนเสริมที่ใช้
RUN docker-php-ext-install pdo pdo_mysql

# เปิด mod_rewrite
RUN a2enmod rewrite

# ตั้ง timezone (ถ้าต้องการ)
ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# เปิด opcache เพื่อประสิทธิภาพ
RUN docker-php-ext-install opcache
# คอนฟิก opcache เบาๆ
RUN { \
  echo 'opcache.enable=1'; \
  echo 'opcache.validate_timestamps=0'; \
  echo 'opcache.max_accelerated_files=20000'; \
  echo 'opcache.memory_consumption=128'; \
  echo 'opcache.interned_strings_buffer=16'; \
} > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html
COPY . /var/www/html

# (ถ้าใช้โฟลเดอร์ public เป็น root ให้ปลดคอมเมนต์ 3 บรรทัดนี้)
# ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
# RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf
# WORKDIR /var/www/html/public

EXPOSE 80
