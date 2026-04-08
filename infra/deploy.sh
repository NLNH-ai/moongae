#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/company-website}"
REPO_DIR="${REPO_DIR:-$APP_ROOT}"
FRONTEND_DIR="${FRONTEND_DIR:-$REPO_DIR/frontend}"
BACKEND_DIR="${BACKEND_DIR:-$REPO_DIR/backend}"
DIST_DIR="${DIST_DIR:-$APP_ROOT/dist}"
RUN_DIR="${RUN_DIR:-$APP_ROOT/run}"
LOG_DIR="${LOG_DIR:-$APP_ROOT/logs}"
ENV_FILE="${ENV_FILE:-/etc/company-website/env}"
PID_FILE="${PID_FILE:-$RUN_DIR/company-website.pid}"
JAR_TARGET="${JAR_TARGET:-$RUN_DIR/company-website.jar}"
GIT_BRANCH="${GIT_BRANCH:-main}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:8080/api/health}"

log() {
  printf '[deploy] %s\n' "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_command git
require_command npm
require_command curl
require_command rsync

if [[ ! -x "$BACKEND_DIR/gradlew" ]]; then
  chmod +x "$BACKEND_DIR/gradlew"
fi

if [[ -f "$ENV_FILE" ]]; then
  log "Loading environment from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

mkdir -p "$DIST_DIR" "$RUN_DIR" "$LOG_DIR"

if [[ -d "$REPO_DIR/.git" ]]; then
  log "Pulling latest source from branch $GIT_BRANCH"
  git -C "$REPO_DIR" pull --ff-only origin "$GIT_BRANCH"
else
  log "Skipping git pull because $REPO_DIR is not a git checkout"
fi

log "Building frontend"
npm --prefix "$FRONTEND_DIR" ci
npm --prefix "$FRONTEND_DIR" run build
rsync -a --delete "$FRONTEND_DIR/dist/" "$DIST_DIR/"

log "Building backend"
"$BACKEND_DIR/gradlew" --project-dir "$BACKEND_DIR" --no-daemon bootJar

LATEST_JAR="$(ls -t "$BACKEND_DIR"/build/libs/*.jar | head -n 1)"
install -m 0644 "$LATEST_JAR" "$JAR_TARGET"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  OLD_PID="$(cat "$PID_FILE")"
  log "Stopping existing application process $OLD_PID"
  kill "$OLD_PID"
  wait "$OLD_PID" 2>/dev/null || true
elif pgrep -f "$JAR_TARGET" >/dev/null 2>&1; then
  log "Stopping existing application process detected by jar path"
  pkill -f "$JAR_TARGET" || true
fi

log "Starting new application jar with nohup"
nohup java -jar "$JAR_TARGET" >"$LOG_DIR/application.log" 2>&1 &
echo $! >"$PID_FILE"

if command -v nginx >/dev/null 2>&1; then
  log "Reloading nginx"
  sudo nginx -t
  sudo systemctl reload nginx
fi

log "Waiting for health check"
for attempt in {1..20}; do
  if curl -fsS "$HEALTHCHECK_URL" >/dev/null; then
    log "Deployment succeeded"
    exit 0
  fi

  sleep 3
done

log "Health check failed: $HEALTHCHECK_URL"
exit 1
