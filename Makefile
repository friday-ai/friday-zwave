build:
	@docker-compose build --no-cache

prod:
	@docker-compose -f docker-compose.yml \
		up -d --remove-orphans

log:
	@docker container logs -n 20 friday-zwave