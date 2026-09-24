#!/usr/bin/env bash
# Helper for running compusChat with Docker Compose.
# Usage: ./docker.sh <command>
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f server/.env ]; then
  echo "server/.env not found. Copy server/.env.example to server/.env and fill in DATABASE_URL, GEMINI_API_KEY, SESSION_SECRET." >&2
  exit 1
fi

case "${1:-help}" in
  up)       docker compose up --build -d ;;
  down)     docker compose down ;;
  restart)  docker compose restart ;;
  rebuild)  docker compose build --no-cache && docker compose up -d ;;
  logs)     docker compose logs -f "${2:-}" ;;
  status)   docker compose ps ;;
  migrate)  docker compose exec server npm run db:migrate ;;
  seed)     docker compose exec server npm run db:seed ;;
  shell)    docker compose exec "${2:-server}" sh ;;
  help|*)
    cat <<EOF
Usage: ./docker.sh <command>

  up        Build and start client + server in the background
  down      Stop and remove containers
  restart   Restart containers
  rebuild   Rebuild images without cache and start
  logs [s]  Follow logs (optionally for one service: server | client)
  status    Show container status
  migrate   Run database migrations (Neon)
  seed      Seed the database
  shell [s] Open a shell in a container (default: server)
EOF
    ;;
esac
