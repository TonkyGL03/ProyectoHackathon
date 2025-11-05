# CareControl - Aplicación de Recordatorios Médicos

Aplicación diseñada específicamente para enfermeros y cuidadores que manejan múltiples pacientes.

## 🚀 Instalación

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd carecontrol
   ```

2. **Instalar todas las dependencias**
   ```bash
   npm install
   ```
   
   O si usas yarn:
   ```bash
   yarn install
   ```

3. **Ejecutar el proyecto en modo desarrollo**
   ```bash
   npm run dev
   ```
   
   O con yarn:
   ```bash
   yarn dev
   ```

4. **Abrir en el navegador**
   
   El proyecto se ejecutará en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Preview de la build de producción
- `npm run lint` - Ejecuta el linter

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4.0** - Framework de CSS
- **Radix UI** - Componentes de UI accesibles
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

## 📱 Características

- ✅ Gestión de pacientes múltiples
- ✅ Recordatorios de medicamentos
- ✅ Signos vitales y historial médico
- ✅ Programación de medicamentos
- ✅ Historial completo de administración
- ✅ Interfaz responsive
- ✅ Configuración personalizable

## 📄 Estructura del Proyecto

```
carecontrol/
├── components/          # Componentes React
│   ├── ui/             # Componentes de UI reutilizables
│   └── ...             # Componentes específicos de la app
├── styles/             # Estilos globales CSS
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── package.json        # Dependencias y scripts
```

## 🔧 Configuración Adicional

Si necesitas personalizar la configuración:

- **Tailwind CSS**: Edita `styles/globals.css`
- **TypeScript**: Edita `tsconfig.json`
- **Vite**: Edita `vite.config.ts`

## 📝 Notas

- El proyecto usa Tailwind CSS 4.0 con configuración en CSS
- Los componentes de UI están basados en shadcn/ui
- Se recomienda usar Node.js 18 o superior

## 🐛 Troubleshooting

### Error al instalar dependencias
```bash
# Limpia la caché de npm
npm cache clean --force
# Borra node_modules y package-lock.json
rm -rf node_modules package-lock.json
# Reinstala
npm install
```

### Puerto 5173 ocupado
El servidor de desarrollo intentará usar otro puerto automáticamente.

## 📞 Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

---

Desarrollado con ❤️ para el equipo de CareControl
