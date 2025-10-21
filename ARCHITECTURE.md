# 🏗️ SUMATE - Arquitectura del Sistema

## 📊 Descripción General

SUMATE es una aplicación web para reportar incidentes urbanos en Cochabamba, Bolivia. Sistema dockerizado con arquitectura de microservicios.

## 🎯 Arquitectura Actualizada (Octubre 2025)

### **Nginx Reverse Proxy** (Nuevo)
- Punto único de entrada al sistema
- Manejo de SSL/TLS
- Balanceo de carga
- Seguridad mejorada (solo puerto 80/443 expuesto)

### **Servicios Backend**
- **Backend API** (Go) - Puerto interno 8080
- **Admin Backend API** (Go) - Puerto interno 8081
- **PostgreSQL** - Sin puerto expuesto externamente

### **Servicios Frontend**
- **Frontend** (PWA) - Puerto interno 80
- **Admin Frontend** - Puerto interno 80
- **Landing Page (Nivel 3)** - Puerto interno 80

---

## 📁 Estructura del Proyecto

```
SUMATE/
├── nginx/                      # ← NUEVO: Reverse Proxy
│   ├── Dockerfile
│   ├── nginx.conf             # Configuración principal
│   └── conf.d/
│       ├── frontend.conf      # Routing para app
│       ├── admin.conf         # Routing para admin
│       └── landing.conf       # Routing para landing
│
├── landing/                    # ← MODULARIZADO Nivel 3
│   ├── src/
│   │   ├── components/        # Web Components (JS)
│   │   │   ├── hero-component.js
│   │   │   ├── features-component.js
│   │   │   ├── how-to-component.js
│   │   │   ├── cta-component.js
│   │   │   └── footer-component.js
│   │   ├── scripts/
│   │   │   ├── config/
│   │   │   │   └── app-config.js
│   │   │   ├── modules/
│   │   │   │   ├── component-renderer.js
│   │   │   │   ├── platform-detector.js
│   │   │   │   ├── pwa-installer.js
│   │   │   │   ├── qr-generator.js
│   │   │   │   └── tab-switcher.js
│   │   │   └── main.js
│   │   ├── styles/           # CSS Modular (13 archivos)
│   │   │   ├── base/
│   │   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── main.css
│   │   └── data/
│   │       └── content.js    # Contenido separado
│   ├── public/
│   │   └── videos/
│   ├── index.html            # Ultra-limpio (solo contenedor)
│   ├── Dockerfile
│   └── nginx.conf
│
├── frontend/                  # PWA Principal
├── backend/                   # API Go
├── admin/                     # Panel Admin
│   ├── frontend/
│   └── backend/
│
└── docker-compose.yml         # Orquestación completa
```

---

## 🌐 Routing y Dominios

### **Nginx como Reverse Proxy**

| Dominio | Servicio | Puerto Interno |
|---------|----------|----------------|
| `zta.148.230.91.96.nip.io` | Frontend PWA | 80 |
| `zta.148.230.91.96.nip.io/api/` | Backend API | 8080 |
| `admin-zta.148.230.91.96.nip.io` | Admin Frontend | 80 |
| `admin-zta.148.230.91.96.nip.io/api/` | Admin Backend | 8081 |
| `download-zta.148.230.91.96.nip.io` | Landing Page | 80 |

**Solo Nginx expone puertos externos (80/443)**

---

## 🎨 Landing Page - Nivel 3 (Web Components)

### **Características**
- ✅ Componentes renderizados dinámicamente desde JavaScript
- ✅ Contenido separado en `content.js`
- ✅ HTML ultra-limpio (solo contenedor)
- ✅ CSS modularizado (13 archivos)
- ✅ JavaScript modular (ES6 Modules)
- ✅ Performance optimizado

### **Ventajas**
1. **Modularidad extrema**: Cada componente es independiente
2. **Contenido centralizado**: Fácil de actualizar textos/URLs
3. **Escalabilidad**: Agregar componentes es trivial
4. **Mantenibilidad**: Código organizado y documentado
5. **Performance**: Lazy loading, tree-shaking listo

### **Cómo Funciona**
```javascript
// 1. main.js inicializa la app
import { renderAllComponents } from './modules/component-renderer.js';

// 2. Component renderer carga todos los componentes
renderAllComponents(); // Inserta HTML dinámicamente

// 3. Cada componente genera su HTML
export function renderHero() {
    return `<section class="hero">...</section>`;
}

// 4. Contenido viene de content.js
import { CONTENT } from '../data/content.js';
```

---

## 🔒 Seguridad

### **Mejoras Implementadas**
1. ✅ **Reverse Proxy**: Solo Nginx expuesto externamente
2. ✅ **Puertos Internos**: Backend/Frontend sin puertos públicos
3. ✅ **PostgreSQL**: Base de datos completamente aislada
4. ✅ **Headers de Seguridad**: X-Frame-Options, CSP, HSTS, etc.
5. ✅ **CORS Controlado**: Solo en rutas API necesarias

### **Headers Aplicados**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000" always;
```

---

## 🚀 Despliegue

### **Local (Desarrollo)**
```bash
docker-compose up -d
```

### **Producción (VPS)**
```bash
# 1. Pull del repositorio
cd /opt/sumak && git pull origin main

# 2. Reconstruir servicios
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. Verificar
docker-compose ps
docker logs sumate-nginx --tail 50
```

### **Solo Landing (Prueba)**
```bash
cd landing
docker build -t sumaq-landing .
docker run -p 8888:80 sumaq-landing
```

---

## 📊 Estadísticas del Proyecto

### **Landing Page**
- **Archivos CSS**: 13 módulos
- **Archivos JS**: 6 módulos (incluyendo components)
- **Componentes**: 5 componentes Web
- **Líneas de código**: ~1,500 (bien organizadas)
- **Design Tokens**: 50+ variables CSS

### **Sistema Completo**
- **Contenedores**: 7 (nginx, db, 2 backends, 3 frontends)
- **Servicios**: 6 aplicaciones
- **Volúmenes**: 2 (postgres_data, uploads_data)
- **Redes**: 1 (sumate-network)

---

## 🔧 Mantenimiento

### **Actualizar contenido de Landing**
```javascript
// Editar: landing/src/data/content.js
export const CONTENT = {
    hero: {
        title: 'NUEVO TÍTULO',
        // ...
    }
};
```

### **Agregar nuevo componente**
```javascript
// 1. Crear: landing/src/components/nuevo-component.js
export function renderNuevo() {
    return `<section>...</section>`;
}

// 2. Importar en: landing/src/scripts/modules/component-renderer.js
import { renderNuevo } from '../../components/nuevo-component.js';
```

### **Modificar routing de Nginx**
```nginx
# Editar: nginx/conf.d/frontend.conf
location /nueva-ruta/ {
    proxy_pass http://backend:8080/;
}
```

---

## 📚 Tecnologías Utilizadas

### **Frontend**
- **PWA**: Progressive Web App
- **JavaScript**: ES6 Modules, Web Components
- **CSS**: CSS Modules, Variables CSS, BEM
- **Build**: Docker multi-stage

### **Backend**
- **Go**: Gin framework
- **PostgreSQL**: Database
- **Docker**: Containerización

### **Infraestructura**
- **Nginx**: Reverse proxy + Static serving
- **Docker Compose**: Orquestación
- **nip.io**: DNS wildcard para desarrollo

---

## 🎯 Próximos Pasos

1. [ ] Implementar HTTPS con Let's Encrypt
2. [ ] Configurar CI/CD (GitHub Actions)
3. [ ] Monitoreo y logs centralizados
4. [ ] Rate limiting en Nginx
5. [ ] Cacheo de assets estáticos

---

## 👥 Equipo

- **Desarrollo**: Claude Code + tunek12421
- **Fecha**: Octubre 2025
- **Versión**: 2.0 (Arquitectura Modular + Reverse Proxy)

---

## 📄 Licencia

Todos los derechos reservados © 2025 SUMAQ
