# Sistema de Digiturno - Backend

Backend para el sistema de gestión de turnos digitales (Digiturno) con soporte para múltiples sedes.

## Funcionalidades

- Gestión de turnos por sede
- Sistema multi-sede (multi-tenant)
- Autenticación y autorización por roles
- Gestión de módulos de atención
- Notificaciones en tiempo real con WebSockets

## Requisitos previos

- Node.js >= 14
- PostgreSQL >= 12
- npm o yarn

## Configuración inicial

1. **Clonar el repositorio**

```bash
git clone <url-repositorio>
cd DigiturnoApp2/backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configuración de variables de entorno**

Crear archivo `.env` en la raíz del proyecto (o modificar el existente) con la siguiente configuración:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_DATABASE=digiturno
PORT=4000
NODE_ENV=development
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=24h
```

4. **Crear la base de datos**

```sql
CREATE DATABASE digiturno;
```

5. **Inicializar la base de datos**

```bash
npm run seed
```

Esto creará una sede principal y un usuario administrador con las siguientes credenciales:
- Email: admin@example.com
- Contraseña: admin123

## Ejecutar la aplicación

### Modo desarrollo

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

### Ejecutar en producción

```bash
npm start
```

## Estructura del proyecto

```
src/
  ├── config/          # Configuraciones (DB, etc.)
  ├── controllers/     # Controladores de la API
  ├── entities/        # Modelos de datos (TypeORM)
  ├── middlewares/     # Middlewares Express
  ├── routes/          # Rutas de la API
  ├── services/        # Servicios de lógica de negocio
  ├── utils/           # Utilidades y funciones auxiliares
  └── server.ts        # Punto de entrada principal
```

## Endpoints de la API

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token JWT

### Sedes

- `GET /api/sedes` - Obtener todas las sedes
- `GET /api/sedes/:id` - Obtener sede por ID
- `POST /api/sedes` - Crear nueva sede (requiere rol admin)
- `PUT /api/sedes/:id` - Actualizar sede (requiere rol admin)
- `DELETE /api/sedes/:id` - Eliminar sede (requiere rol admin)

### Motivos de visita

- `GET /api/motivos-visita/sede/:sedeId` - Obtener motivos de una sede
- `GET /api/motivos-visita/:id` - Obtener motivo por ID
- `POST /api/motivos-visita` - Crear nuevo motivo (requiere rol admin/supervisor)
- `PUT /api/motivos-visita/:id` - Actualizar motivo (requiere rol admin/supervisor)
- `DELETE /api/motivos-visita/:id` - Eliminar motivo (requiere rol admin)

### Módulos

- `GET /api/modulos/sede/:sedeId` - Obtener módulos de una sede
- `GET /api/modulos/:id` - Obtener módulo por ID
- `POST /api/modulos` - Crear nuevo módulo (requiere rol admin/supervisor)
- `PUT /api/modulos/:id` - Actualizar módulo (requiere rol admin/supervisor)
- `DELETE /api/modulos/:id` - Eliminar módulo (requiere rol admin/supervisor)

### Turnos

- `GET /api/turnos/activos/sede/:sedeId` - Obtener turnos activos de una sede
- `GET /api/turnos/sede/:sedeId` - Obtener turnos por fecha (requiere autenticación)
- `POST /api/turnos` - Crear nuevo turno
- `PUT /api/turnos/:id/estado` - Actualizar estado de un turno (requiere autenticación)

### Usuarios

- `GET /api/usuarios` - Obtener todos los usuarios (requiere rol admin/supervisor)
- `GET /api/usuarios/:id` - Obtener usuario por ID (requiere autenticación)
- `POST /api/usuarios` - Crear nuevo usuario (requiere rol admin/supervisor)
- `PUT /api/usuarios/:id` - Actualizar usuario (requiere rol admin/supervisor)
- `PUT /api/usuarios/:id/password` - Cambiar contraseña

## WebSockets (Socket.io)

El servidor expone los siguientes eventos de Socket.io:

### Cliente -> Servidor

- `join-sede`: Unirse a una sala específica para una sede

### Servidor -> Cliente

- `nuevo-turno`: Notifica cuando se crea un nuevo turno
- `turno-actualizado`: Notifica cuando se actualiza un turno (cambio de estado)

## Licencia

Este proyecto es propiedad de [Tu empresa].
