#!/bin/sh
set -e

# Aplica las migraciones versionadas (idempotente) antes de arrancar.
echo "→ Aplicando migraciones de base de datos…"
../../node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

# Semilla opcional de usuarios por rol (solo si SEED_ON_START=true).
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "→ Ejecutando seed…"
  ../../node_modules/.bin/ts-node prisma/seed.ts || echo "seed omitido/fallido (continuando)"
fi

echo "→ Iniciando API…"
exec node dist/src/main.js
