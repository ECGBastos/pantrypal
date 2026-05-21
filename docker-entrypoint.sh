#!/bin/sh
set -e

mkdir -p /data

npx prisma migrate deploy

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  npm run prisma:seed
fi

exec node server.js
