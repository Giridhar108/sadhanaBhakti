#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Create it from .env.production.example." >&2
  exit 1
fi

set -a
. "./$ENV_FILE"
set +a

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

compose config --quiet

if ! docker image inspect postgres:16-alpine >/dev/null 2>&1; then
  compose pull postgres
fi

compose up -d postgres
compose build
compose run --rm api npm run prisma:deploy
compose up -d --remove-orphans --wait --wait-timeout 120

curl --fail --silent --show-error \
  --retry 10 --retry-delay 2 --retry-connrefused \
  "http://${WEB_BIND_ADDRESS:-127.0.0.1}:${WEB_PORT:-8080}/api/health"
echo
compose ps
