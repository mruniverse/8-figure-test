#!/bin/sh

# Docker entrypoint script for development

set -e

echo "🔄 Generating Prisma Client..."
npx prisma generate

echo "🔄 Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "✅ Database synced!"
echo "🚀 Starting Next.js development server..."

# Start the Next.js dev server
exec npm run dev
