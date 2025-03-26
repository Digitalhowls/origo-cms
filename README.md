# Origo CMS

Un CMS modular y headless diseñado para ofrecer flexibilidad y una excelente experiencia de desarrollo, con una arquitectura multi-tenant, constructor visual de páginas y un sistema de módulos extensible.

## Características principales

- 🏗️ **Sistema modular**: Arquitectura flexible que permite extender la funcionalidad con nuevos módulos.
- 🌐 **Headless por diseño**: API robusta para entregar contenido a cualquier plataforma.
- 📝 **Editor visual de páginas**: Constructor de páginas basado en bloques para crear diseños sin escribir código.
- 📊 **Panel de administración**: Interfaz intuitiva para gestionar contenido y configuraciones.
- 🔄 **Multi-tenant**: Soporte para múltiples organizaciones con configuraciones independientes.
- 📱 **Responsive**: Diseñado para funcionar perfectamente en dispositivos móviles y de escritorio.

## Tecnologías

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Base de datos**: PostgreSQL
- **ORM**: Drizzle ORM
- **Gestión de estado**: Zustand, TanStack Query
- **Autenticación**: Passport.js

## Estructura del proyecto

El proyecto sigue una estructura clara y organizada:

```
origo-cms/
├── client/             # Código del frontend (React)
│   └── src/
│       ├── components/ # Componentes reutilizables
│       ├── hooks/      # Hooks personalizados
│       ├── lib/        # Utilidades y configuraciones
│       └── pages/      # Páginas de la aplicación
├── server/             # Código del backend (Express)
│   ├── middleware/     # Middleware de Express
│   ├── services/       # Servicios de la aplicación
│   └── routes.ts       # Definición de rutas API
└── shared/             # Código compartido entre cliente y servidor
    ├── schema.ts       # Esquemas de la base de datos
    └── types.ts        # Tipos compartidos
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/origo-cms.git
   cd origo-cms
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` basado en `.env.example`
   - Agrega tu URL de PostgreSQL en `DATABASE_URL`

4. Ejecuta las migraciones:
   ```bash
   npm run db:push
   ```

5. Inicia el proyecto:
   ```bash
   npm run dev
   ```

## Uso

1. Accede a `http://localhost:5000` en tu navegador
2. Regístrate o inicia sesión con las credenciales de administrador
   - Email: admin@origo.com
   - Contraseña: admin123

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).