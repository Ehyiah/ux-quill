DOCKER_COMPOSE?= docker compose
EXEC?= $(DOCKER_COMPOSE) exec
EXECYARN?= $(DOCKER_COMPOSE) exec -w /var/www/symfony/assets
PHP?= $(EXEC) php
COMPOSER?= $(PHP) composer
CONSOLE?= $(PHP) php bin/console
YARN?= $(EXECYARN) php yarn

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation
install: build up vendor

update: up vendor

##@ Docker
build: ## Build the images
	$(DOCKER_COMPOSE) build --no-cache --build-arg APP_USER_ID=$$(id -u) --build-arg APP_USER=$$(id -u -n)

up: ## Up the images
	$(DOCKER_COMPOSE) up -d --remove-orphans

down: ## Down the images
	$(DOCKER_COMPOSE) down

.PHONY: build up down update install vendor

##@ Composer
vendor: composer.lock ## Install composer dependency
	$(COMPOSER) install

##@ Assets
assets: node_modules ## Compile bundle assets for prod
	$(EXECYARN) php rm -rf ./dist
	$(YARN) build

watch: node_modules ## Watch bundle assets
	$(YARN) watch

node_modules: assets ## Install yarn dependency
	$(YARN) install

.PHONY: assets watch node_modules

##@ Utility
bash-php: ## Launch PHP bash
	$(PHP) bash

.PHONY: bash-php

##@ CI
ci: ## Launch csfixer and phpstan and javascript quality check
	$(YARN) lint
	$(COMPOSER) ci

fixer-php: ## Launch csfixer no dry
	$(COMPOSER) phpcsfixer

fixer-js:  ## Corriger les problèmes de tests JavaScript
	$(YARN) lint-fix

.PHONY: ci fixer-php phptests jstests fixer-js

phptests:
	$(PHP) vendor/bin/phpunit

jstests:  ## Exécuter les tests JavaScript
	$(YARN) test
