#!/bin/bash

echo "🛠️ 1/2: Construyendo la app web (npm run build)..."

docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  node:lts \
  npm run build

echo " "
echo "🔄 2/2: Sincronizando con Android (npx cap sync)..."

docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  node:lts \
  npx cap sync android

echo " "
echo "✅ ¡Sincronización completa!"
echo "Ahora abre Android Studio y presiona Play ▶"
