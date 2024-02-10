ENV?= dev
BRANCH?= dev

#
# DOCKER VAR
#
DOCKER_COMPOSE?= docker-compose
EXEC?= $(DOCKER_COMPOSE) exec
EXECYARN?= $(DOCKER_COMPOSE) exec -w /var/www/symfony/assets

PHP?= $(EXEC) php
COMPOSER?= $(PHP) composer
CONSOLE?= $(PHP) php bin/console
YARN?= $(EXECYARN) php yarn

ifeq ($(SKIP_DOCKER),true)
	PHP= php
	COMPOSER= composer
	CONSOLE= $(PHP) bin/console
	EXECYARN= yarn
endif

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation
install: build up vendor reload down ## Install new project with docker

update: vendor up clear-logs ## update after checkout

##@ Docker
build: ## Build the images
	$(DOCKER_COMPOSE) build --no-cache --build-arg APP_USER_ID=$$(id -u) --build-arg APP_USER=$$(id -u -n)

up: ## Up the images
	$(DOCKER_COMPOSE) up -d --remove-orphans

down: ## Down the images
	$(DOCKER_COMPOSE) down

destroy:down ## Destroy all containers and images
	-docker rm $$(docker ps -a -q)
	-docker rmi $$(docker images -q)

clear-logs: ## clear application logs
	@if [ -d ./var/log ]; \
	then\
  		rm -R ./var/log;\
  	fi

## don't forget this if you dont want makefile to get files with this name
.PHONY: build up down destroy clear-logs update install reload vendor

##@ Composer
vendor: composer.lock ## Install composer dependency
	$(COMPOSER) install

##@ Assets
assets: node_modules ## Install assets
	$(YARN) build

watch: node_modules ## Watch front update
	$(YARN) watch

node_modules: assets ## Install yarn dependency
	$(YARN) install

.PHONY: assets watch node_modules

##@ Utility
clear: ## Clear cache symfony
	$(CONSOLE) ca:cl

bash-php: ## Launch PHP bash
	$(PHP) bash

.PHONY: clear bash-php

##@ CI
ci: ## Launch csfixer and phpstan and javascript quality check
	$(YARN) lint
	$(COMPOSER) ci

fixer-php: ## Launch csfixer no dry
	$(COMPOSER) phpcsfixer

.PHONY: ci fixer-php phptests

phptests:
	$(PHP) vendor/bin/phpunit
