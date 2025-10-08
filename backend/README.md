# SUMATE Backend API

Backend API en Go para la aplicación SUMATE PWA.

## Requisitos

- Go 1.21 o superior
- Cuenta de Firebase
- Credenciales de Firebase (archivo JSON)

## Configuración

### 1. Instalar dependencias

```bash
cd backend
go mod download
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings** → **Service Accounts**
4. Click en **Generate New Private Key**
5. Descarga el archivo JSON y guárdalo en un lugar seguro (NO lo subas a git)

### 3. Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```
FIREBASE_CREDENTIALS=/ruta/absoluta/a/tu/firebase-credentials.json
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
PORT=8080
```

### 4. Ejecutar el servidor

```bash
# Exportar variables de entorno
export $(cat .env | xargs)

# Ejecutar servidor
go run main.go
```

O usar air para hot-reload en desarrollo:

```bash
go install github.com/cosmtrek/air@latest
air
```

## Endpoints

### POST /api/reports

Crear un nuevo reporte con foto y ubicación.

**Request Body:**

```json
{
  "description": "Descripción del reporte",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**

```json
{
  "id": "abc123",
  "description": "Descripción del reporte",
  "latitude": -34.6037,
  "longitude": -58.3816,
  "photo_url": "https://storage.googleapis.com/...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/reports

Obtener todos los reportes ordenados por fecha (más recientes primero).

**Response:**

```json
[
  {
    "id": "abc123",
    "description": "Descripción del reporte",
    "latitude": -34.6037,
    "longitude": -58.3816,
    "photo_url": "https://storage.googleapis.com/...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/reports/:id

Obtener un reporte específico por ID.

### GET /health

Health check endpoint.

## Estructura del proyecto

```
backend/
├── main.go              # Aplicación principal
├── go.mod               # Dependencias
├── .env.example         # Ejemplo de variables de entorno
└── README.md           # Esta documentación
```

## Producción

Para compilar para producción:

```bash
go build -o sumate-api main.go
```

Ejecutar:

```bash
export $(cat .env | xargs)
./sumate-api
```
