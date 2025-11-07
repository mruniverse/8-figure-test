# Makefile for AI-Powered To-Do List Application
# Provides convenient commands for Docker operations

.PHONY: help build up down restart logs clean dev shell prisma-migrate prisma-studio test

# Project name for Docker Compose
REPO_NAME := 8figure-todolist

# Colors for terminal output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target - show help
help:
	@echo "$(CYAN)========================================$(NC)"
	@echo "$(GREEN)  To-Do List Application - Make Commands$(NC)"
	@echo "$(CYAN)========================================$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev           - Start development server (auto-runs migrations)"
	@echo "  make build         - Build Docker images"
	@echo "  make up            - Start containers (auto-runs migrations)"
	@echo "  make down          - Stop and remove containers"
	@echo "  make restart       - Restart containers"
	@echo "  make logs          - View container logs"
	@echo "  make shell         - Open shell in Next.js container"
	@echo ""
	@echo "$(YELLOW)Database (Prisma):$(NC)"
	@echo "  make prisma-generate    - Generate Prisma Client"
	@echo "  make prisma-migrate-dev - Create and apply dev migration"
	@echo "  make prisma-studio      - Open Prisma Studio"
	@echo "  make prisma-reset       - Reset database (WARNING: deletes data)"
	@echo "  make prisma-push        - Push schema changes without migration"
	@echo ""
	@echo "$(YELLOW)Note:$(NC) Migrations run automatically when starting containers"
	@echo ""
	@echo "$(YELLOW)Cleanup:$(NC)"
	@echo "  make clean         - Remove containers, volumes, and build cache"
	@echo "  make clean-all     - Deep clean (includes node_modules)"
	@echo ""

# Build Docker images
build:
	@echo "$(CYAN)Building Docker images...$(NC)"
	docker-compose -f docker/compose.yaml build

# Start development server
dev: up
	@echo "$(GREEN)✓ Development server started at http://localhost:3000$(NC)"

# Start containers
up:
	@echo "$(CYAN)Starting containers...$(NC)"
	docker-compose -f docker/compose.yaml -p $(REPO_NAME) up -d --build
	@echo "$(GREEN)✓ Containers started$(NC)"
	@echo "$(YELLOW)View logs with: make logs$(NC)"

# Stop containers
down:
	@echo "$(CYAN)Stopping containers...$(NC)"
	docker-compose -f docker/compose.yaml -p $(REPO_NAME) down --remove-orphans
	@echo "$(GREEN)✓ Containers stopped$(NC)"

# Restart containers
restart: down up
	@echo "$(GREEN)✓ Containers restarted$(NC)"

# View logs
logs:
	@echo "$(CYAN)Showing container logs (Ctrl+C to exit)...$(NC)"
	docker-compose -f docker/compose.yaml logs -f

# Open shell in Next.js container
shell:
	@echo "$(CYAN)Opening shell in Next.js container...$(NC)"
	docker exec -it todolist-nextjs-dev sh

# Generate Prisma Client
prisma-generate:
	@echo "$(CYAN)Generating Prisma Client...$(NC)"
	docker exec -it todolist-nextjs-dev npx prisma generate
	@echo "$(GREEN)✓ Prisma Client generated$(NC)"

# Run Prisma migrations (production)
prisma-migrate:
	@echo "$(CYAN)Running Prisma migrations...$(NC)"
	docker exec -it todolist-nextjs-dev npx prisma migrate deploy
	@echo "$(GREEN)✓ Migrations applied$(NC)"

# Create and run new migration (development)
prisma-migrate-dev:
	@echo "$(CYAN)Creating and applying new migration...$(NC)"
	@read -p "Enter migration name: " migration_name; \
	docker exec -it todolist-nextjs-dev npx prisma migrate dev --name $$migration_name
	@echo "$(GREEN)✓ Migration created and applied$(NC)"

# Open Prisma Studio
prisma-studio:
	@echo "$(CYAN)Opening Prisma Studio at http://localhost:5555...$(NC)"
	docker exec -it todolist-nextjs-dev npx prisma studio

# Reset database (WARNING: deletes all data)
prisma-reset:
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker exec -it todolist-nextjs-dev npx prisma migrate reset --force; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	else \
		echo "$(YELLOW)Aborted$(NC)"; \
	fi

# Push schema changes without creating migration
prisma-push:
	@echo "$(CYAN)Pushing schema changes to database...$(NC)"
	docker exec -it todolist-nextjs-dev npx prisma db push
	@echo "$(GREEN)✓ Schema pushed$(NC)"

# Clean containers and volumes
clean:
	@echo "$(CYAN)Cleaning up containers and volumes...$(NC)"
	docker-compose -f docker/compose.yaml down -v
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

# Deep clean (including node_modules)
clean-all: clean
	@echo "$(CYAN)Performing deep clean...$(NC)"
	rm -rf node_modules
	rm -rf .next
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

# Install dependencies
install:
	@echo "$(CYAN)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

# Run tests (placeholder for future)
test:
	@echo "$(CYAN)Running tests...$(NC)"
	docker exec -it todolist-nextjs-dev npm test
