#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
PUBLIC_DIR="${BACKEND_DIR}/public"
SKIP_FRONTEND_BUILD="${SKIP_FRONTEND_BUILD:-0}"

echo "==> Starting deploy"

if ! command -v php >/dev/null 2>&1; then
  echo "ERROR: php is not installed"
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "ERROR: composer is not installed"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1 && [[ "${SKIP_FRONTEND_BUILD}" != "1" ]]; then
  echo "ERROR: npm is not installed"
  echo "Tip: upload prebuilt frontend/dist and run with SKIP_FRONTEND_BUILD=1"
  exit 1
fi

if [[ ! -f "${BACKEND_DIR}/.env" ]]; then
  echo "ERROR: ${BACKEND_DIR}/.env is missing"
  echo "Create it from backend/.env.example before running deploy."
  exit 1
fi

echo "==> Installing backend dependencies"
composer install --working-dir="${BACKEND_DIR}" --no-dev --optimize-autoloader --no-interaction

if [[ "${SKIP_FRONTEND_BUILD}" != "1" ]]; then
  echo "==> Building frontend assets"
  if [[ -f "${FRONTEND_DIR}/package-lock.json" ]]; then
    npm ci --prefix "${FRONTEND_DIR}"
  else
    npm install --prefix "${FRONTEND_DIR}"
  fi

  # Shared hosting often has low thread limits; keep Vite/Rolldown single-threaded.
  export RAYON_NUM_THREADS="${RAYON_NUM_THREADS:-1}"
  export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-1}"
  npm run build --prefix "${FRONTEND_DIR}"
else
  echo "==> Skipping frontend build (SKIP_FRONTEND_BUILD=1)"
fi

if [[ ! -d "${FRONTEND_DIR}/dist" ]]; then
  echo "ERROR: frontend/dist was not created"
  echo "Build frontend locally and upload frontend/dist, or run without SKIP_FRONTEND_BUILD."
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
