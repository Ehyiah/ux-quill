ENV?= dev
BRANCH?= dev

#
# DOCKER VAR
#
DOCKER_COMPOSE?= docker-compose
ifeq ($(OS), Windows_NT)
    EXEC?= winpty $(DOCKER_COMPOSE) exec
else
    EXEC?= $(DOCKER_COMPOSE) exec
endif

PHP?= $(EXEC) php
NGINX?= $(EXEC) nginx
CADDY?= $(EXEC) caddy
DB?= $(EXEC) db
COMPOSER?= $(PHP) composer
CONSOLE?= $(PHP) php bin/console
PHPUNIT?= $(PHP) php bin/phpunit
YARN?= $(PHP) yarn

ifeq ($(SKIP_DOCKER),true)
	PHP= php
	NGINX= nginx
	DB= db
	COMPOSER= composer
	CONSOLE= $(PHP) bin/console
	YARN= yarn
endif

help:  ## Display this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation
install: env_local build up vendor node_modules reload down ## Install new project with docker

update: vendor node_modules reload up clear-logs ## update after checkout

update-force: build vendor node_modules reload up clear-logs ## update after checkout with rebuild of docker image

reload: db-reload db-fixtures ## reload application databases and fixtures

##@ Create env file
env_local: .env ## Create the .env.local file
	@if [ -f .env.local ]; \
	then\
        echo '\033[1;41m/!\ The .env.local file already exist.\033[0m';\
	    exit 0;\
	else\
		echo cp .env .env.local;\
		cp .env .env.local;\
		echo '\033[1;41m/!\ The .env.local file has been created. Please modify your file to your need.\033[0m';\
		exit 0;\
	fi

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
.PHONY: build up down destroy clear-logs update install reload vendor env_local

##@ Composer
vendor: composer.lock ## Install composer dependency
	$(COMPOSER) install

##@ Assets
assets: node_modules ## Install assets
	$(YARN) encore production

watch: node_modules ## Watch front update
	$(YARN) encore dev --watch

node_modules: yarn.lock assets ## Install yarn dependency
	$(YARN) install

.PHONY: assets watch node_modules

##@ Database
db-create: ## Create the database and it's shema
	$(CONSOLE) doctrine:database:create --if-not-exists

db-dump: ## Dump migration diff
	$(CONSOLE) doctrine:schema:update --dump-sql

db-diff: ## Generate a new doctrine migration
	$(CONSOLE) doctrine:migrations:diff

db-mig: ## Apply doctrine migrations
	$(CONSOLE) doctrine:migrations:migrate --no-interaction --allow-no-migration

db-validate:  ## Validate the doctrine ORM mapping
	$(CONSOLE) doctrine:schema:validate

db-reload:  ## Create the database and it's schema
	$(CONSOLE) doctrine:database:drop --if-exists --force
	$(CONSOLE) doctrine:database:create --if-not-exists
	$(CONSOLE) doctrine:migrations:migrate --no-interaction --allow-no-migration

db-force: .env.local vendor ## Validate the doctrine ORM mapping
	$(CONSOLE) doctrine:schema:update --force

db-fixtures: .env.local vendor ## Launch fixtures BDD
	$(CONSOLE) doctrine:fixtures:load --no-interaction

db-schema: ## force reload DB without migrations
	$(CONSOLE) doctrine:database:drop --if-exists --force
	$(CONSOLE) doctrine:database:create --if-not-exists
	$(CONSOLE) doctrine:schema:update --force --no-interaction
	$(CONSOLE) doctrine:fixtures:load --no-interaction

.PHONY: db-create db-diff db-mig db-dump db-validate db-reload db-force db-fixtures db-schema

##@ Utility
clear: ## Clear cache symfony
	$(CONSOLE) c:c

bash-php: ## Launch PHP bash
	$(PHP) bash

bash-caddy: ## Launch NGINX bash
	$(CADDY) sh

bash-db: ## Launch DB bash
	$(DB) bash

server-dump: ## Launch dumper on console
	$(CONSOLE) server:dump

.PHONY: clear bash-php bash-db bash-caddy server-dump

##@ CI
ci: ## Launch csfixer and phpstan and javascript quality check
	$(YARN) lintfix
	$(COMPOSER) ci

.PHONY: ci phptests phptestsall phptestspanther clear-screenshots

##@ Commands related to application
clear-screenshots: ## clear panther screenshots
	@if [ -d ./var/screenshots ]; \
	then\
		rm -R ./var/screenshots;\
	fi

##@ TEST
phptests:  ## Execute phpunit classic tests without panther tagged tests
	$(CONSOLE)  doctrine:database:drop --if-exists --force --env=test
	$(CONSOLE)  doctrine:database:create --env=test
	$(CONSOLE)  doctrine:schema:update --force --env=test
	$(CONSOLE)  doctrine:fixtures:load -n --env=test
	$(CONSOLE)  c:c --env=test
	$(PHPUNIT)  --exclude-group panther

phptestspanther: assets clear-screenshots ## execute panther E2E tagged tests only
	$(CONSOLE) doctrine:database:drop --if-exists --force --env=test
	$(CONSOLE) doctrine:database:create --env=test
	$(CONSOLE) doctrine:schema:update --force --env=test
	$(CONSOLE) doctrine:fixtures:load -n --env=test
	$(CONSOLE) app:products:import -n --env=test
	$(CONSOLE) c:c --env=test
	$(PHPUNIT) --group panther

phptestsall: phptests phptestspanther
