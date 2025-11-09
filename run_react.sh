#!/bin/bash

# --- Script para iniciar el servidor de desarrollo (npm run dev) en Docker ---

echo "🐳 Iniciando servidor de desarrollo de CareControl..."
echo "Abriendo puerto 3000..."

# -it: Modo interactivo (para que puedas usar Ctrl+C)
# --rm: Borra el contenedor al cerrarlo
# -v "$(pwd)":/app: Monta tu carpeta actual en /app
# -w /app: Fija el directorio de trabajo dentro del contenedor
# -p 3000:3000: Mapea tu puerto 3000 al puerto 3000 del contenedor
# node:lts: Usa la imagen de Node.js
# npm run dev -- --host: El comando que ejecuta Vite y lo expone

docker run -it --rm \
  -v "$(pwd)":/app \
  -w /app \
  -p 3000:3000 \
  node:lts \
  npm run dev -- --host

echo "Servidor detenido."