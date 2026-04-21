DOCKER := $(shell which docker)
COMPOSE := $(DOCKER) compose

.PHONY: help boot docker-up docker-stop start dev install db

help:
	@awk 'BEGIN {FS = ":.*##"; printf "\nAll commands available in the Makefile\n \nUsage:\n  make \033[36m<target>\033[0m\n"} /^[.a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

############################## BOOT #################################

boot: install docker-up db start ## Boot the application from scratch

docker-up: ## Start the Docker container
	$(COMPOSE) up -d

docker-stop: ## Stop the Docker container
	$(COMPOSE) stop

start: ## Start the application
	npm run start

dev: ## Start the application in watch mode
	npm run start:dev

install: ## Install dependencies
	npm install

############################## DATABASE ##############################

db: ## Create and migrate the database
	npx prisma generate
	npx prisma migrate dev
