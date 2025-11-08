# CareControl - Aplicación de Recordatorios Médicos

Aplicación diseñada específicamente para enfermeros y cuidadores que manejan múltiples pacientes.

## 🚀 Instalación Web (Local)

### Requisitos Previos
- **Node.js**: Versión 18 o superior.
- **Git**: Para clonar el repositorio.

### Pasos de Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone [URL-DEL-REPOSITORIO]
    cd carecontrol
    ```
    *(Reemplaza `carecontrol` por el nombre de la carpeta si es diferente, ej: `ProyectoHackathon`)*

2.  **Instalar todas las dependencias**
    Este comando lee el `package.json` e instala todo lo necesario (React, Vite, Tailwind, Capacitor, etc.).
    ```bash
    npm install
    ```

3.  **Ejecutar el proyecto en modo desarrollo**
    ```bash
    npm run dev
    ```

4.  **Abrir en el navegador**
    El proyecto se ejecutará en: **`http://localhost:3000`**

---

## 🛠️ Configuración Esencial (¡Leer!)

Este proyecto usa **Tailwind CSS v4** con **Vite**. Esta configuración es muy específica y requiere que 4 archivos estén perfectamente alineados. Si los estilos se ven rotos, revisa esta sección.

1.  **`package.json`**: Debe incluir `"tailwindcss": "^4.x.x"` y `"@tailwindcss/vite"`.
2.  **`vite.config.ts`**: Debe importar y usar el plugin de Tailwind:
    ```ts
    import tailwindcss from '@tailwindcss/vite';
    
    export default defineConfig({
      plugins: [react(), tailwindcss()],
      // ...
    });
    ```
3.  **`tailwind.config.ts`**: Debe existir en la raíz y apuntar a tus archivos fuente:
    ```ts
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}", // ¡Asegúrate de que esto apunte a tus archivos!
      ],
      // ...
    };
    ```
4.  **`src/styles/globals.css`**: (O tu archivo CSS principal) Debe importar el tema y las utilidades de Tailwind v4:
    ```css
    /* Estas son las directivas correctas para v4 con el plugin de Vite */
    @import "tailwindcss/preflight";
    @tailwind utilities;

    /* Tu tema personalizado va aquí (ej. :root, @theme inline) */
    :root {
      --background: #ffffff;
      /* ... */
    }
    ```

---

## 📱 Despliegue a Móvil (Android con Capacitor)

Puedes "envolver" esta aplicación web en una aplicación nativa de Android para instalarla en tus dispositivos.

### Requisitos Adicionales
- **Android Studio**: Descárgalo e instálalo. Deja que el asistente inicial descargue el SDK de Android.
- **Dispositivo Android**: Con la "Depuración por USB" activada (ver Troubleshooting).

### Pasos para la Primera Vez

1.  **Añadir la plataforma Android**
    (Esto solo se hace una vez. Asume que ya hiciste `npm install`).
    ```bash
    # Instala el motor de Android para Capacitor
    npm install @capacitor/android
    
    # Crea la carpeta 'android'
    npx cap add android
    ```

2.  **Configurar el `webDir`**
    Asegúrate de que tu archivo `capacitor.config.json` apunte a la carpeta de salida correcta de Vite (`build`).
    ```json
    {
      "appId": "com.hackathon.carecontrol",
      "appName": "CareControl",
      "webDir": "build",
      "bundledWebRuntime": false
    }
    ```

### Flujo de Trabajo (Para actualizar la app)

Sigue estos 2 pasos cada vez que hagas cambios en el código React y quieras probarlos en tu dispositivo.

1.  **Construir y Sincronizar**
    Este comando compila tu app React (ejecuta `npm run build`) y copia los archivos web finales a la carpeta de Android.
    ```bash
    # 1. Construye la app web
    npm run build
    
    # 2. Sincroniza los archivos con el proyecto Android
    npx cap sync android
    ```

2.  **Compilar e Instalar con Android Studio**
    a. Abre **Android Studio**.
    b. En la pantalla de bienvenida, haz clic en **"Open"**.
    c. Navega y selecciona la carpeta **`android`** (la que está *dentro* de tu proyecto).
    d. Espera a que termine la sincronización de "Gradle" (la barra de abajo).
    e. Conecta tu teléfono o tablet (con Depuración por USB activada).
    f. Asegúrate de que tu dispositivo aparezca en la barra de herramientas.
    g. Presiona el botón verde de **Play (▶)** para instalar y ejecutar la app.

---

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `localhost:3000`.
- `npm run build`: Construye la aplicación web para producción en la carpeta `build/`.
- `npm run preview`: Previsualiza tu build de producción localmente.

## 📄 Estructura del Proyecto
carecontrol/ ├── android/ # Proyecto nativo de Android (Generado por Capacitor) ├── node_modules/ # Dependencias ├── src/ # TU CÓDIGO FUENTE │ ├── components/ # Componentes React │ ├── styles/ # Estilos (globals.css) │ ├── App.tsx # Componente principal │ └── main.tsx # Punto de entrada de React ├── .gitignore ├── capacitor.config.json # Configuración de Capacitor ├── index.html # HTML principal (usado por Vite) ├── package.json # Dependencias y scripts ├── tailwind.config.ts # Configuración de Tailwind └── vite.config.ts # Configuración de Vite---

## 🐛 Troubleshooting (Solución de Problemas)

### "Los estilos se ven rotos" (Todo en blanco y negro)
Tu configuración de Tailwind v4 está mal. Revisa la sección **"🛠️ Configuración Esencial"** y asegúrate de que los 4 archivos (`package.json`, `vite.config.ts`, `tailwind.config.ts`, `globals.css`) estén correctos.

### "Error al instalar dependencias" (ERESOLVE, errores raros)
La caché de `npm` o `node_modules` puede estar corrupta. Ejecuta la "opción nuclear" para limpiar todo y reinstalar.

**En Linux / macOS:**
```bash
rm -rf node_modules
rm package-lock.json
npm cache clean --force
npm install

