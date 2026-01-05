#Commands
help:
	@echo "Usage:"
	@echo "  make build       - Build Docker image"
	@echo "  make up          - Start all containers in background"
	@echo "  make down        - Stop all containers"
	@echo "  make restart     - Restart all containers"
	@echo "  make logs        - Show logs for all containers"

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

restart:
	docker-compose down && docker-compose up -d

logs:
	docker-compose logs -f stock-web