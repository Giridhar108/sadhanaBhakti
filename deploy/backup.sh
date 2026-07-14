#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}
BACKUP_DIR=${BACKUP_DIR:-backups}

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE." >&2
  exit 1
fi

set -a
. "./$ENV_FILE"
set +a

umask 077
mkdir -p "$BACKUP_DIR"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
database_backup="$BACKUP_DIR/database-$timestamp.dump"
audio_backup="$BACKUP_DIR/audio-$timestamp.tar.gz"

cleanup_incomplete_backups() {
  rm -f "$database_backup.tmp" "$audio_backup.tmp"
}

trap cleanup_incomplete_backups 0 HUP INT TERM

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

compose exec -T postgres pg_dump --format=custom -U "$POSTGRES_USER" "$POSTGRES_DB" \
  > "$database_backup.tmp"
compose exec -T api tar -czf - -C /app/uploads audio \
  > "$audio_backup.tmp"

mv "$database_backup.tmp" "$database_backup"
mv "$audio_backup.tmp" "$audio_backup"
trap - 0 HUP INT TERM

echo "Backup created in $BACKUP_DIR ($timestamp)."
