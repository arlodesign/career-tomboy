#!/usr/bin/env bash
# Deploy the WordPress theme to the remote server via rsync over SSH.
# Credentials are read from .env — never committed to the repo.
#
# Usage: deploy-theme.sh [<commit>]   (defaults to HEAD)
#
# Deploys the theme as it exists in <commit>, not the working tree, so
# uncommitted edits in wp-theme/ never go live.
#
# Required .env vars:
#   WP_SSH_HOST   — Host alias from ~/.ssh/config (preferred, keeps the real
#                   hostname out of this repo entirely) or a hostname
#   WP_SSH_PATH   — Absolute path to the theme directory on the server
#                   e.g. /var/www/html/wp-content/themes/career-tomboy-headless
# Optional:
#   WP_SSH_USER   — SSH username; omit when the ~/.ssh/config alias sets User
#   WP_SSH_PORT   — SSH port (defaults to 22, or the alias's Port)
#   WP_SSH_KEY    — Private key path; omit when the alias sets IdentityFile

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"

# Load WP_SSH_* vars from .env without executing it as shell code
if [[ -f "$ENV_FILE" ]]; then
    while IFS='=' read -r key value; do
        case "$key" in
            WP_SSH_USER|WP_SSH_HOST|WP_SSH_PATH|WP_SSH_PORT|WP_SSH_KEY)
                export "$key=$value"
                ;;
        esac
    done < "$ENV_FILE"
fi

# Skip gracefully if credentials are not configured
if [[ -z "${WP_SSH_HOST:-}" || -z "${WP_SSH_PATH:-}" ]]; then
    echo "ℹ  WP_SSH_* vars not set in .env — skipping theme deploy."
    exit 0
fi

COMMIT="$(git -C "$ROOT_DIR" rev-parse --short "${1:-HEAD}")"
DEST="${WP_SSH_USER:+$WP_SSH_USER@}$WP_SSH_HOST:$WP_SSH_PATH/"

SSH_CMD="ssh -o IdentitiesOnly=yes"
[[ -n "${WP_SSH_PORT:-}" ]] && SSH_CMD+=" -p $WP_SSH_PORT"
[[ -n "${WP_SSH_KEY:-}" ]] && SSH_CMD+=" -i $WP_SSH_KEY"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
git -C "$ROOT_DIR" archive "$COMMIT" wp-theme/career-tomboy-headless | tar -x -C "$STAGE"

echo "Deploying WordPress theme to $WP_SSH_HOST ($COMMIT)..."

# --checksum: archive mtimes are the commit time, so compare contents instead
# and only transfer files that actually changed.
rsync -avz --checksum --delete \
    -e "$SSH_CMD" \
    "$STAGE/wp-theme/career-tomboy-headless/" \
    "$DEST"

# Record what's live so the reference-transaction hook only redeploys when
# wp-theme/ differs from it.
git -C "$ROOT_DIR" rev-parse "$COMMIT" > "$(git -C "$ROOT_DIR" rev-parse --absolute-git-dir)/ct-theme-deployed"

echo "Theme deployed."
