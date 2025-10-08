#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
until pg_isready -h db -U postgres; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Run migrations
psql -h db -U postgres -d sumate -f /app/database/schema.sql

echo "Database initialized successfully!"
