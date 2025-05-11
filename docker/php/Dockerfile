FROM php:8.1.0

MAINTAINER Matthieu Gostiaux<rei_eva@hotmail.com>

COPY --from=composer:2.8.8 /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y  --fix-missing \
    openssl \
    acl \
    git \
    zip \
    unzip \
    nano \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_22.x -o node_setup.sh && \
    bash node_setup.sh && \
    apt-get install -y nodejs && \
    npm install npm -g && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn && \
    rm -rf /var/lib/apt/lists/*

ARG APP_USER=www-data
ARG APP_GROUP=www-data
ARG APP_USER_ID=1000
ARG APP_GROUP_ID=1000

COPY ./scripts/ /tmp/scripts/
RUN chmod +x -R /tmp/scripts/
RUN /tmp/scripts/create-user.sh ${APP_USER} ${APP_GROUP} ${APP_USER_ID} ${APP_GROUP_ID}

USER $APP_USER

WORKDIR /var/www/symfony
