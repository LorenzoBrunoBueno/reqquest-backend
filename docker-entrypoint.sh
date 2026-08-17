#!/bin/sh
set -e

echo "Aplicando migrations pendentes..."
npx prisma migrate deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Rodando seed..."
  npm run db:seed
fi

echo "Iniciando servidor..."
exec node dist/server.js
