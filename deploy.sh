#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
PUBLIC_DIR="${BACKEND_DIR}/public"

echo "==> Starting deploy"

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php is not installed"
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "ERROR: composer is not installed"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed"
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "ERROR: ${BACKEND_DIR}/.env is missing"
  echo "Create it from backend/.env.example before running deploy."
  exit 1
fi

echo "==> Installing backend dependencies"
composer install --working-dir="${BACKEND_DIR}" --no-dev --optimize-autoloader --no-interaction

echo "==> Building frontend assets"
if [[ -f "${FRONTEND_DIR}/package-lock.json" ]]; then
  npm ci --prefix "${FRONTEND_DIR}"
else
  npm install --prefix "${FRONTEND_DIR}"
fi
npm run build --prefix "${FRONTEND_DIR}"

if [[ ! -d "${FRONTEND_DIR}/dist" ]]; then
  echo "ERROR: frontend/dist was not created"
  exit 1
fi

echo "==> Syncing frontend build to backend/public"
rm -rf "${PUBLIC_DIR}/assets"
mkdir -p "${PUBLIC_DIR}/assets"
cp -R "${FRONTEND_DIR}/dist/assets/." "${PUBLIC_DIR}/assets/"

for file in index.html favicon.svg icons.svg; do
  if [[ -f "${FRONTEND_DIR}/dist/${file}" ]]; then
    cp "${FRONTEND_DIR}/dist/${file}" "${PUBLIC_DIR}/${file}"
  fi
done

echo "==> Running Laravel optimization and migrations"
php "${BACKEND_DIR}/artisan" migrate --force
php "${BACKEND_DIR}/artisan" storage:link || true
php "${BACKEND_DIR}/artisan" optimize:clear
php "${BACKEND_DIR}/artisan" optimize

echo "==> Deploy completed successfully"
