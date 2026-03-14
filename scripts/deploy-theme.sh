#!/usr/bin/env bash
# Deploy the WordPress theme to the remote server via rsync over SSH.
# Credentials are read from .env — never committed to the repo.
#
# Required .env vars:
#   WP_SSH_USER   — SSH username
#   WP_SSH_HOST   — SSH hostname or IP
#   WP_SSH_PATH   — Absolute path to the theme directory on the server
#                   e.g. /var/www/html/wp-content/themes/career-tomboy-headless
#   WP_SSH_PORT   — SSH port (optional, defaults to 22)

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"

# Load WP_SSH_* vars from .env without executing it as shell code
if [[ -f "$ENV_FILE" ]]; then
    while IFS='=' read -r key value; do
        case "$key" in
            WP_SSH_USER|WP_SSH_HOST|WP_SSH_PATH|WP_SSH_PORT)
                export "$key=$value"
                ;;
        esac
    done < "$ENV_FILE"
fi

# Skip gracefully if credentials are not configured
if [[ -z "${WP_SSH_USER:-}" || -z "${WP_SSH_HOST:-}" || -z "${WP_SSH_PATH:-}" ]]; then
    echo "ℹ  WP_SSH_* vars not set in .env — skipping theme deploy."
    exit 0
fi

PORT="${WP_SSH_PORT:-22}"
THEME_DIR="$ROOT_DIR/wp-theme/career-tomboy-headless"
COMMIT_HASH="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"

echo "Deploying WordPress theme to $WP_SSH_HOST ($COMMIT_HASH)..."

rsync -avz --delete \
    -e "ssh -p $PORT -o IdentitiesOnly=yes ${WP_SSH_KEY:+-i $WP_SSH_KEY}" \
    "$THEME_DIR/" \
    "$WP_SSH_USER@$WP_SSH_HOST:$WP_SSH_PATH/"

echo "Theme deployed."
