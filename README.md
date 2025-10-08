# 📍 SUMATE - PWA de Reportes con Ubicación

Aplicación web progresiva (PWA) para reportar incidentes con foto y ubicación GPS, desarrollada con **Go (backend)**, **PostgreSQL (base de datos)** y **JavaScript vanilla (frontend)**.

## 🚀 Características

- 📷 **Captura de fotos** desde la cámara del dispositivo
- 📍 **Geolocalización automática** o manual
- 💾 **Almacenamiento local** con PostgreSQL y filesystem
- 📱 **PWA instalable** en Android y iOS
- 🔄 **Funcionalidad offline** con Service Workers
- 🐳 **Completamente dockerizado** - deploy con un comando
- 🎨 **Diseño responsive** y móvil-first
- ⚡ **Backend rápido** en Go con API REST

## 📁 Estructura del Proyecto

```
SUMATE/
├── backend/                    # API en Go
│   ├── main.go                 # Aplicación principal
│   ├── go.mod                  # Dependencias
│   ├── Dockerfile              # Docker para backend
│   ├── .dockerignore           # Exclusiones Docker
│   └── database/
│       ├── schema.sql          # Schema PostgreSQL
│       └── init.sh             # Script de inicialización
│
├── frontend/                   # PWA
│   ├── index.html              # Página principal
│   ├── app.js                  # Lógica de la aplicación
│   ├── styles.css              # Estilos
│   ├── manifest.json           # Configuración PWA
│   ├── service-worker.js       # Service Worker
│   ├── nginx.conf              # Configuración nginx
│   ├── Dockerfile              # Docker para frontend
│   ├── .dockerignore           # Exclusiones Docker
│   └── icon-*.png              # Iconos de la app
│
├── docker-compose.yml          # Orquestación de servicios
├── Makefile                    # Comandos útiles
├── .gitignore                  # Exclusiones Git
└── README.md                   # Esta documentación
```

## 🛠️ Instalación y Configuración

### Prerequisitos

- **Docker** - [Instalar Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** - [Instalar Docker Compose](https://docs.docker.com/compose/install/)

Verificar instalación:
```bash
docker --version
docker-compose --version
```

### Instalación Rápida (Docker)

**1. Clonar o navegar al proyecto:**
```bash
cd /home/tunek/Proyectos/SUMATE
```

**2. Generar iconos para la PWA:**

Abre `frontend/generate-icons.html` en tu navegador y descarga todos los iconos generados en la carpeta `frontend/`.

**3. Levantar todos los servicios:**
```bash
# Con Make (recomendado)
make up

# O directamente con docker-compose
docker-compose up -d
```

**4. Verificar que todo esté corriendo:**
```bash
make status

# O
docker-compose ps
```

**5. Acceder a la aplicación:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Health Check:** http://localhost:8080/health

¡Listo! 🎉

## 📋 Comandos Disponibles (Makefile)

```bash
make help           # Mostrar ayuda
make build          # Construir imágenes Docker
make up             # Iniciar servicios
make down           # Detener servicios
make restart        # Reiniciar servicios
make logs           # Ver logs de todos los servicios
make backend-logs   # Ver logs del backend
make frontend-logs  # Ver logs del frontend
make db-logs        # Ver logs de la base de datos
make psql           # Conectar a PostgreSQL
make status         # Estado de los servicios
make clean          # Eliminar contenedores y volúmenes
make db-reset       # Resetear base de datos (⚠️ borra datos)
```

## 🐳 Arquitectura Docker

### Servicios:

1. **Database (PostgreSQL)**
   - Puerto: `5432`
   - Usuario: `postgres`
   - Contraseña: `postgres`
   - Base de datos: `sumate`
   - Volumen: `postgres_data` (persistente)

2. **Backend (Go + Gin)**
   - Puerto: `8080`
   - Healthcheck: `/health`
   - Volumen: `uploads_data` (fotos persistentes)
   - Auto-retry conexión a DB

3. **Frontend (Nginx)**
   - Puerto: `3000`
   - Sirve PWA estática
   - Configuración optimizada

### Volúmenes:
- `postgres_data`: Base de datos PostgreSQL
- `uploads_data`: Fotos subidas por usuarios

### Red:
- `sumate-network`: Red bridge interna

## 🔧 Desarrollo Local (sin Docker)

### Backend

```bash
cd backend

# Instalar dependencias
go mod download

# Configurar variables de entorno
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=sumate
export PORT=8080
export BASE_URL=http://localhost:8080
export UPLOADS_DIR=./uploads

# Ejecutar
go run main.go
```

**Nota:** Necesitas PostgreSQL corriendo localmente.

### Frontend

```bash
cd frontend

# Opción 1: Python
python3 -m http.server 3000

# Opción 2: Node.js
npx http-server -p 3000 -c-1
```

## 📱 Uso de la Aplicación

1. **Tomar foto:**
   - Clic en "📷 Tomar Foto"
   - Permite acceso a la cámara
   - Selecciona o toma una foto

2. **Obtener ubicación:**
   - Clic en "📍 Obtener Ubicación Automática"
   - Permite acceso a la ubicación
   - O ingresa coordenadas manualmente

3. **Agregar descripción:**
   - Escribe los detalles del incidente

4. **Enviar:**
   - Clic en "Enviar Reporte"
   - El reporte aparecerá en la lista

5. **Ver reportes:**
   - Los reportes se muestran ordenados por fecha
   - Click en coordenadas abre Google Maps

## 🧪 Testing

### Test de la API

**Health check:**
```bash
curl http://localhost:8080/health
```

**Crear reporte:**
```bash
curl -X POST http://localhost:8080/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test desde terminal",
    "latitude": -34.6037,
    "longitude": -58.3816,
    "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Obtener reportes:**
```bash
curl http://localhost:8080/api/reports
```

### Acceder a la base de datos

```bash
# Conectar a PostgreSQL
make psql

# O directamente
docker-compose exec db psql -U postgres -d sumate

# Ver reportes
SELECT * FROM reports;

# Ver estructura
\d reports
```

## 📦 Despliegue a Producción

### Opción 1: Docker en VPS (DigitalOcean, AWS EC2, etc.)

```bash
# En el servidor
git clone <tu-repositorio>
cd SUMATE

# Configurar variables de entorno (opcional)
# Editar docker-compose.yml si necesitas cambiar puertos

# Levantar servicios
docker-compose up -d

# Configurar Nginx/Caddy como reverse proxy
# para HTTPS y dominios personalizados
```

**Ejemplo de configuración Nginx:**
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
    }
}
```

### Opción 2: Google Cloud Run

```bash
# Backend
cd backend
gcloud builds submit --tag gcr.io/tu-proyecto/sumate-backend
gcloud run deploy sumate-backend --image gcr.io/tu-proyecto/sumate-backend

# Frontend
cd frontend
gcloud builds submit --tag gcr.io/tu-proyecto/sumate-frontend
gcloud run deploy sumate-frontend --image gcr.io/tu-proyecto/sumate-frontend
```

### Opción 3: Kubernetes

Archivos de ejemplo en `k8s/` (crear si necesario).

## 🔒 Consideraciones de Seguridad

### Para producción:

1. **Cambiar credenciales de base de datos:**
   Editar `docker-compose.yml`:
   ```yaml
   environment:
     POSTGRES_USER: usuario_seguro
     POSTGRES_PASSWORD: contraseña_fuerte_aquí
   ```

2. **Usar HTTPS:**
   - La cámara y geolocalización requieren HTTPS en producción
   - Usar Nginx/Caddy con Let's Encrypt

3. **CORS:**
   - En producción, configurar `AllowOrigins` específicos en `backend/main.go`:
   ```go
   config.AllowOrigins = []string{"https://tudominio.com"}
   ```

4. **Rate limiting:**
   - Agregar middleware de rate limiting en el backend

5. **Validación de imágenes:**
   - El backend valida tipo y tamaño (max 10MB)
   - Considerar escaneo antivirus si es crítico

6. **Backup de base de datos:**
   ```bash
   # Backup
   docker-compose exec db pg_dump -U postgres sumate > backup.sql

   # Restore
   docker-compose exec -T db psql -U postgres sumate < backup.sql
   ```

## 🐛 Troubleshooting

### La base de datos no inicia

```bash
# Ver logs
make db-logs

# Resetear base de datos
make db-reset
```

### El backend no se conecta a la DB

```bash
# Verificar que la DB esté healthy
docker-compose ps

# Reiniciar backend
docker-compose restart backend

# Ver logs
make backend-logs
```

### Las fotos no se cargan

```bash
# Verificar permisos del volumen
docker-compose exec backend ls -la /root/uploads

# Verificar que BASE_URL esté correcto
docker-compose exec backend env | grep BASE_URL
```

### La PWA no se instala

- Verifica que todos los iconos existan
- Abre DevTools → Application → Manifest
- Verifica que el Service Worker esté registrado
- En producción, requiere HTTPS

### Error de CORS

- Verifica que el backend esté corriendo
- Verifica la configuración CORS en `backend/main.go`
- Verifica que el frontend use la URL correcta

## 📊 Monitoring

### Logs en tiempo real

```bash
# Todos los servicios
make logs

# Solo backend
make backend-logs

# Solo frontend
make frontend-logs

# Solo database
make db-logs
```

### Métricas

```bash
# Estado de contenedores
docker stats

# Uso de volúmenes
docker system df -v
```

## 🔄 Actualización

```bash
# Pull cambios
git pull

# Rebuild y reiniciar
make build
make up
```

## 📚 Stack Tecnológico

- **Backend:** Go 1.21, Gin Framework
- **Base de datos:** PostgreSQL 15
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **PWA:** Service Workers, Web App Manifest
- **APIs:** Camera API, Geolocation API
- **Containerización:** Docker, Docker Compose
- **Servidor web:** Nginx (Alpine)

## 📄 Licencia

MIT

## 👤 Autor

Tu Nombre

---

## 🆘 Soporte

¿Problemas? Abre un issue en GitHub o contacta al equipo de desarrollo.

**Quick Start:**
```bash
make install  # Verificar dependencias
make up       # Iniciar todo
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:8080
- Health: http://localhost:8080/health
# sumak
# sumak
