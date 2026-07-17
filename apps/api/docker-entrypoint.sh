#!/bin/sh
set -e

# pnpm coloca los binarios de las dependencias del paquete en su node_modules
# local (apps/api/node_modules/.bin). Se resuelve con fallback a la raíz por
# robustez ante cambios de layout.
resolve_bin() {
  for p in "node_modules/.bin/$1" "../../node_modules/.bin/$1"; do
    if [ -x "$p" ]; then
      echo "$p"
      return 0
    fi
  done
  echo "ERROR: no se encontró el binario '$1' en node_modules" >&2
  return 1
}

PRISMA="$(resolve_bin prisma)"

# Aplica las migraciones versionadas (idempotente) antes de arrancar.
echo "→ Aplicando migraciones de base de datos…"
"$PRISMA" migrate deploy --schema=prisma/schema.prisma

# Semilla opcional de usuarios por rol (solo si SEED_ON_START=true).
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "→ Ejecutando seed…"
  TSNODE="$(resolve_bin ts-node)" && "$TSNODE" prisma/seed.ts \
    || echo "seed omitido/fallido (continuando)"
fi

echo "→ Iniciando API…"
exec node dist/src/main.js
