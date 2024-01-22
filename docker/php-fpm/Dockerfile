FROM php:8.2.1-fpm
ARG TIMEZONE="Europe/Paris"

MAINTAINER Matthieu Gostiaux<rei_eva@hotmail.com>

COPY --from=composer:2.4.4 /usr/bin/composer /usr/bin/composer

# Install requierements
RUN apt-get update && apt-get install -y  --fix-missing \
    openssl \
    acl \
    git \
    zip \
    unzip \
    libpq-dev \
    zlib1g-dev \
    libzip-dev\
    libonig-dev \
    libgmp-dev \
    libpng-dev \
    libjpeg-dev \
    libjpeg62 \
    libicu-dev \
    libxml2-dev \
    libmagickwand-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    gnupg2 \
    nano \
    iputils-ping \
    pkg-config \
    wget \
    rsync

# Set timezone
RUN ln -snf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && echo ${TIMEZONE} > /etc/timezone \
&& printf '[PHP]\ndate.timezone = "%s"\n', ${TIMEZONE} > /usr/local/etc/php/conf.d/tzone.ini

# Type docker-php-ext-install to see available extensions
RUN docker-php-ext-configure gd --with-jpeg=/usr \
&& docker-php-source extract \
&& docker-php-ext-install gd xml mbstring gmp pdo pdo_mysql intl zip \
&& pecl install imagick \
&& docker-php-ext-enable imagick \
&& docker-php-source delete

# Node.js
RUN curl -sL https://deb.nodesource.com/setup_18.x -o node_setup.sh && \
    bash node_setup.sh && \
    apt-get install -y nodejs && \
    npm install npm -g

# Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn

# CREATE USER
# default values are below, but they are overwritten in make build command with your current user ID and NAME
ARG APP_USER=www-data
ARG APP_GROUP=www-data
ARG APP_USER_ID=1000
ARG APP_GROUP_ID=1000

COPY ./scripts/ /tmp/scripts/
RUN chmod +x -R /tmp/scripts/
RUN /tmp/scripts/create-user.sh ${APP_USER} ${APP_GROUP} ${APP_USER_ID} ${APP_GROUP_ID}

RUN rm -rf /var/lib/apt/lists/*

USER $APP_USER
WORKDIR /var/www/symfony

CMD ["php-fpm"]
