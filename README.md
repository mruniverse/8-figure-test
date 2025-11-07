# AI-Powered To-Do List Application

DEMO: https://8-figure-test-vjnj.vercel.app/

A full-stack to-do list application with AI enhancement features, built with Next.js, Prisma, Supabase, and n8n. This project demonstrates clean, modular, and scalable code following **SOLID principles**.

## 🚀 Features

-   **Full CRUD Operations**: Create, Read, Update, and Delete tasks
-   **Global Shared List**: All users interact with the same task list (no authentication required)
-   **AI Task Enhancement**: Enhance tasks with AI-generated descriptions and step-by-step plans
-   **Real-time Data Persistence**: All data stored in Supabase PostgreSQL
-   **Type-Safe Database**: Prisma for migrations and type-safe database access
-   **Docker Support**: Containerized development environment with hot reload
-   **WhatsApp Integration** (Bonus): Interact with your to-do list via WhatsApp
-   **Clean Architecture**: Following SOLID principles with repository pattern and dependency injection

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 with TypeScript, React 19, Tailwind CSS
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: Prisma (type-safe database access & migrations)
-   **Containerization**: Docker & Docker Compose
-   **AI Automation**: n8n (workflow automation)
-   **Deployment**: Vercel
-   **Version Control**: GitHub

## 📋 Prerequisites

-   **Node.js 18+** and npm (or Docker Desktop)
-   **Supabase account** ([supabase.com](https://supabase.com))
-   **n8n instance** (cloud or self-hosted)
-   **Docker Desktop** (optional, for containerized development)
-   **Make** (optional, for convenient commands)

## � Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and navigate
git clone <your-repo-url>
cd 8-figure-test

# 2. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Start with Docker (migrations run automatically)
make dev
```

App will be available at http://localhost:3000

**Note:** Database migrations run automatically when the container starts!

See [Docker Guide](docs/DOCKER_GUIDE.md) for detailed instructions.

### Option 2: Local Development

```bash
# 1. Clone and install
git clone <your-repo-url>
cd 8-figure-test
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 3. Generate Prisma Client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Start development server
npm run dev
```

## 🔧 Setup Instructions

enhancement_steps JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

### 1. Supabase Setup

1. **Create a Supabase Project**

    - Go to [supabase.com](https://supabase.com) and create a new project
    - Wait for the project to be provisioned

2. **Get Connection Strings**
    - Go to **Project Settings** > **Database** > **Connection string**
    - Copy **Transaction pooler** URL (for `DATABASE_URL`)
    - Copy **Session pooler** URL (for `DIRECT_URL`)
    - Copy your **Project URL** and **anon key** from **API** settings

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Prisma Database Configuration
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# N8N Webhook (for AI enhancement)
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

### 3. Database Migration with Prisma

#### Using Docker (Recommended)

```bash
# Start containers
make dev

# Run migration to create tables
make prisma-migrate-dev
```

#### Using Local Environment

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

See [Prisma Migration Guide](docs/PRISMA_MIGRATION.md) for detailed instructions.

### 4. n8n Workflow Setup

#### Option A: Using n8n Cloud

1. Sign up at [n8n.io](https://n8n.io)
2. Create a new workflow
3. Import the workflow from `docs/n8n-workflow.json` (see below)

#### Option B: Self-hosted n8n

```bash
# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### Creating the AI Enhancement Workflow

1. Create a new workflow in n8n
2. Add a **Webhook** node (trigger):
    - Method: POST
    - Path: `enhance-task`
    - Copy the webhook URL
3. Add an **OpenAI** node (or your preferred LLM):

    - Configure with your API key
    - Prompt template:

        ```
        Enhance this task with a better description and provide step-by-step instructions:

        Task: {{ $json.title }}
        Description: {{ $json.description }}

        Respond in JSON format:
        {
          "enhancedDescription": "...",
          "enhancementSteps": ["step 1", "step 2", ...]
        }
        ```

4. Add a **Respond to Webhook** node:

    - Return the JSON response from OpenAI

5. Save and activate the workflow
6. Copy the webhook URL and add it to your `.env`

### 5. Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Available Commands

### Docker Commands (using Make)

```bash
make help              # Show all available commands
make dev               # Start development server
make build             # Build Docker images
make up                # Start containers
make down              # Stop containers
make logs              # View logs
make shell             # Open shell in container
make clean             # Clean up containers and volumes
```

### Prisma Commands

```bash
make prisma-generate       # Generate Prisma Client
make prisma-migrate-dev    # Create and apply migration
make prisma-studio         # Open Prisma Studio
make prisma-push           # Push schema without migration
make prisma-reset          # Reset database (⚠️ deletes data)
```

### NPM Commands

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint
```

## 🏗️ Project Structure (SOLID Principles)

```
8-figure-test/
├── docker/                           # Docker configuration
│   ├── Dockerfile                    # Multi-stage build
│   └── compose.yaml                  # Service orchestration
├── prisma/                           # Database schema
│   ├── schema.prisma                 # Prisma schema definition
│   └── migrations/                   # Version-controlled migrations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── tasks/
│   │   │       ├── route.ts          # GET, POST tasks
│   │   │       └── [id]/
│   │   │           ├── route.ts      # GET, PATCH, DELETE task
│   │   │           └── enhance/
│   │   │               └── route.ts  # POST enhance task
│   │   └── page.tsx                  # Main UI page
│   ├── components/
│   │   ├── TaskForm.tsx              # Single Responsibility: Task creation
│   │   ├── TaskItem.tsx              # Single Responsibility: Task display
│   │   └── TaskList.tsx              # Single Responsibility: Task list
│   ├── hooks/
│   │   └── useTasks.ts               # Custom hook for API calls
│   ├── lib/
│   │   ├── prisma/
│   │   │   └── client.ts             # Prisma Client singleton
│   │   └── supabase/
│   │       ├── client.ts             # Supabase client (legacy)
│   │       └── database.types.ts     # TypeScript types
│   ├── models/
│   │   └── task.model.ts             # Domain models & DTOs
│   ├── repositories/
│   │   ├── task.repository.interface.ts  # Dependency Inversion
│   │   ├── task.repository.ts        # Supabase implementation (legacy)
│   │   └── task.repository.prisma.ts # Prisma implementation (current)
│   └── services/
│       ├── ai.service.ts             # AI enhancement logic
│       └── task.service.ts           # Business logic layer
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # SOLID principles explained
│   ├── DOCKER_GUIDE.md               # Docker setup and usage
│   ├── PRISMA_MIGRATION.md           # Prisma migration guide
│   ├── N8N_SETUP.md                  # n8n configuration
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── DIAGRAMS.md                   # Architecture diagrams
├── Makefile                          # Convenient Docker commands
├── .dockerignore                     # Docker build exclusions
└── README.md                         # This file
```

│ └── task.model.ts # Domain entities and DTOs
├── repositories/
│ ├── task.repository.interface.ts # Interface Segregation
│ └── task.repository.ts # Dependency Inversion
└── services/
├── task.service.ts # Business logic layer
└── ai.service.ts # AI enhancement service

````

### SOLID Principles Implementation

1. **Single Responsibility**: Each class/component has one reason to change
   - `TaskForm`: Handles task creation only
   - `TaskItem`: Displays and manages a single task
   - `SupabaseTaskRepository`: Database operations only

2. **Open/Closed**: Extend without modifying
   - Repository interface allows different implementations
   - Service layer can be extended with new methods

3. **Liskov Substitution**: Subtypes are substitutable
   - Any `ITaskRepository` implementation works with `TaskService`

4. **Interface Segregation**: Clients depend on minimal interfaces
   - Separate interfaces for repository and service layers

5. **Dependency Inversion**: Depend on abstractions
   - Services depend on interfaces, not concrete implementations
   - Easy to mock for testing

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `N8N_WEBHOOK_URL`
5. Deploy!

### GitHub Setup

```bash
git add .
git commit -m "feat: AI-powered todo list with SOLID principles"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
````

## 🎁 Bonus: WhatsApp Integration

### Setup Evolution API

1. Deploy Evolution API (Docker recommended):

    ```bash
    docker run -d \
      --name evolution-api \
      -p 8080:8080 \
      atendai/evolution-api
    ```

2. Create a WhatsApp instance via the API

### n8n WhatsApp Workflow

1. Create a new n8n workflow
2. Add **Webhook** trigger for Evolution API events
3. Add **Filter** node:
    - Condition: Message contains `#todolist`
4. Add **Function** node to parse commands:
    - `#todolist add <title>` - Add task
    - `#todolist list` - List all tasks
5. Add **HTTP Request** nodes to call your Next.js API:
    - URL: `https://your-app.vercel.app/api/tasks`
    - Use the same endpoints as the web app
6. Add **Send WhatsApp Message** node with response

### Testing

Send a WhatsApp message to your number:

```
#todolist add Buy groceries
```

## 📚 API Documentation

### GET /api/tasks

Get all tasks

**Response:**

```json
{
	"tasks": [
		{
			"id": "uuid",
			"title": "Task title",
			"description": "Task description",
			"isCompleted": false,
			"enhancedDescription": null,
			"enhancementSteps": null,
			"createdAt": "2024-01-01T00:00:00Z",
			"updatedAt": "2024-01-01T00:00:00Z"
		}
	]
}
```

### POST /api/tasks

Create a new task

**Request:**

```json
{
	"title": "Task title",
	"description": "Optional description"
}
```

### PATCH /api/tasks/[id]

Update a task

**Request:**

```json
{
	"title": "Updated title",
	"description": "Updated description",
	"isCompleted": true
}
```

### DELETE /api/tasks/[id]

Delete a task

### POST /api/tasks/[id]/enhance

Enhance a task with AI

**Response:**

```json
{
  "task": {
    "id": "uuid",
    "enhancedDescription": "AI-generated description",
    "enhancementSteps": ["Step 1", "Step 2", ...]
  }
}
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 License

MIT

## 👨‍💻 Author

Built as a technical assessment project demonstrating:

-   Clean architecture
-   SOLID principles
-   Full-stack development
-   AI integration
-   Modern web technologies
