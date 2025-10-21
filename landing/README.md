# 📱 SUMAQ Landing Page - Documentación Completa

Landing page modular para la aplicación SUMAQ (Sistema Unificado Municipal de Atención Quintana). Esta es una **Progressive Web App (PWA)** que sirve como página de descarga y documentación de la aplicación móvil.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Estructura de Directorios](#estructura-de-directorios)
- [Flujo de Ejecución](#flujo-de-ejecución)
- [Componentes](#componentes)
- [Módulos JavaScript](#módulos-javascript)
- [Sistema de Estilos](#sistema-de-estilos)
- [Configuración](#configuración)
- [Desarrollo Local](#desarrollo-local)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

Esta landing page utiliza una **arquitectura modular (Nivel 3)** que separa responsabilidades en:

```
┌─────────────────────────────────────────┐
│           index.html (Shell)            │
│  - Solo estructura básica               │
│  - Imports de módulos ES6               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          main.js (Orquestador)          │
│  - Inicializa módulos                   │
│  - Coordina componentes                 │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌──────────────────┐   ┌──────────────────┐
│   Components     │   │     Modules      │
│  (UI/HTML)       │   │  (Funcionalidad) │
└──────────────────┘   └──────────────────┘
        ↓                       ↓
┌──────────────────┐   ┌──────────────────┐
│   Content Data   │   │   Utilities      │
│  (content.js)    │   │   (logger.js)    │
└──────────────────┘   └──────────────────┘
```

### Principios de Diseño

1. **Separación de Responsabilidades**: Cada módulo tiene una única responsabilidad
2. **Modularidad**: Componentes reutilizables e independientes
3. **ES6 Modules**: Sistema de imports/exports nativo del navegador
4. **Progressive Enhancement**: Funciona sin JavaScript, mejora con él
5. **Mobile First**: Diseño responsive que prioriza móviles

---

## 📁 Estructura de Directorios

```
landing/
│
├── index.html                 # Punto de entrada (HTML shell mínimo)
├── Dockerfile                 # Configuración Docker con nginx
├── nginx.conf                 # Configuración nginx para servir SPA
├── README.md                  # Esta documentación
│
├── public/                    # Archivos estáticos públicos
│   └── videos/
│       └── phone-video.mp4    # Video demo de la app
│
├── src/                       # Código fuente
│   │
│   ├── components/            # 🎨 Componentes UI (HTML generators)
│   │   ├── hero-component.js       # Sección hero principal
│   │   ├── features-component.js   # Grid de características
│   │   ├── how-to-component.js     # Instrucciones de instalación
│   │   ├── cta-component.js        # Call-to-action final
│   │   └── footer-component.js     # Footer con links
│   │
│   ├── data/                  # 📊 Contenido y configuración
│   │   └── content.js              # TODO el texto, URLs, metadata
│   │
│   ├── scripts/               # ⚙️ Lógica de la aplicación
│   │   ├── main.js                 # Punto de entrada JS
│   │   │
│   │   ├── config/
│   │   │   └── app-config.js       # Configuración técnica (QR, PWA, etc)
│   │   │
│   │   └── modules/                # Módulos funcionales
│   │       ├── component-renderer.js   # Renderiza componentes en el DOM
│   │       ├── platform-detector.js    # Detecta SO (Android/iOS/Desktop)
│   │       ├── pwa-installer.js        # Maneja instalación PWA
│   │       ├── qr-generator.js         # Genera código QR
│   │       └── tab-switcher.js         # Sistema de pestañas
│   │
│   ├── styles/                # 🎨 Estilos CSS modulares
│   │   ├── main.css                # Punto de entrada CSS (imports)
│   │   │
│   │   ├── base/                   # Estilos fundamentales
│   │   │   ├── reset.css           # CSS reset normalizado
│   │   │   ├── variables.css       # Variables CSS (colores, fonts)
│   │   │   └── typography.css      # Tipografía global
│   │   │
│   │   ├── components/             # Estilos de componentes
│   │   │   ├── hero.css
│   │   │   ├── features.css
│   │   │   ├── buttons.css
│   │   │   ├── cards.css
│   │   │   ├── qr-code.css
│   │   │   ├── tabs.css
│   │   │   └── cta-section.css
│   │   │
│   │   └── layout/                 # Estructura y layout
│   │       ├── container.css       # Contenedores principales
│   │       ├── grid.css            # Sistema de grid
│   │       └── footer.css          # Layout del footer
│   │
│   └── utils/                 # 🛠️ Utilidades
│       └── logger.js               # Sistema de logging (dev/prod)
│
└── backup/                    # Versiones anteriores (legacy)
    └── ...
```

---

## 🔄 Flujo de Ejecución

### 1. Carga Inicial (index.html)

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Preload de QRCode library -->
    <link rel="preload" href="https://cdnjs.../qrcode.min.js" as="script">

    <!-- Estilos -->
    <link rel="stylesheet" href="src/styles/main.css">
  </head>
  <body>
    <div id="app">
      <!-- Loading placeholder -->
    </div>

    <!-- 1. Librería externa (QRCode) -->
    <script src="https://cdnjs.../qrcode.min.js"></script>

    <!-- 2. Nuestro código (ES6 module) -->
    <script type="module" src="src/scripts/main.js"></script>
  </body>
</html>
```

### 2. Inicialización (main.js)

```javascript
// 1. Imports
import { renderAllComponents } from './modules/component-renderer.js';
import { initQRGenerator } from './modules/qr-generator.js';
import { pwaInstaller } from './modules/pwa-installer.js';
import { tabSwitcher } from './modules/tab-switcher.js';

// 2. Función de inicialización
function initApp() {
    // Paso 1: Renderizar componentes HTML
    renderAllComponents();

    // Paso 2: Generar QR Code (después del render)
    setTimeout(() => initQRGenerator(), 100);

    // Paso 3: PWA Installer (se auto-inicializa)
    // Paso 4: Tab Switcher (se auto-inicializa)
}

// 3. Ejecutar cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
```

### 3. Renderizado de Componentes

```javascript
// component-renderer.js
export function renderAllComponents() {
    const app = document.getElementById('app');

    // Importa cada componente
    const componentsHTML = `
        ${renderHero()}        // Sección principal
        ${renderFeatures()}    // Características
        ${renderHowTo()}       // Instrucciones
        ${renderCTA()}         // Call to action
        ${renderFooter()}      // Footer
    `;

    app.innerHTML = componentsHTML;
}
```

### 4. Detección de Plataforma y PWA

```javascript
// platform-detector.js
const userAgent = navigator.userAgent;

if (/android/i.test(userAgent)) {
    // Android → Mostrar botón de instalación
    pwaInstaller.show();
} else if (/iPhone|iPad/i.test(userAgent)) {
    // iOS → Mostrar instrucciones manuales
    showIOSInstructions();
}
```

---

## 🎨 Componentes

Todos los componentes están en `src/components/` y exportan funciones que retornan HTML strings.

### hero-component.js

**Qué hace:** Renderiza la sección principal (hero) con título, descripción y botones CTA.

**Estructura:**
```javascript
export function renderHero() {
    return `
        <section class="hero">
            <h1>${CONTENT.hero.title}</h1>
            <p>${CONTENT.hero.description}</p>
            <div class="cta-buttons">
                <a href="${CONTENT.urls.app}">Abrir App</a>
                <button id="installBtn">Instalar</button>
            </div>
            <div id="qrcode"></div>
        </section>
    `;
}
```

**Datos desde:** `src/data/content.js → CONTENT.hero`

### features-component.js

**Qué hace:** Grid de características de la app (3 columnas).

**Estructura:**
```javascript
export function renderFeatures() {
    return `
        <section class="features">
            ${CONTENT.features.map(feature => `
                <div class="feature-card">
                    <span class="icon">${feature.icon}</span>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `).join('')}
        </section>
    `;
}
```

**Datos desde:** `src/data/content.js → CONTENT.features[]`

### how-to-component.js

**Qué hace:** Instrucciones de instalación con pestañas por plataforma (Android, iOS, Desktop).

**Estructura:**
```javascript
export function renderHowTo() {
    return `
        <section class="how-to">
            <!-- Tab buttons -->
            <div class="tabs">
                <button class="tab-btn" data-tab="android">Android</button>
                <button class="tab-btn" data-tab="ios">iOS</button>
                <button class="tab-btn" data-tab="desktop">Desktop</button>
            </div>

            <!-- Tab contents -->
            ${CONTENT.howTo.platforms.map(platform => `
                <div id="${platform.id}" class="tab-content">
                    ${platform.steps.map(step => renderStep(step)).join('')}
                </div>
            `).join('')}
        </section>
    `;
}
```

**Datos desde:** `src/data/content.js → CONTENT.howTo.platforms[]`

### cta-component.js

**Qué hace:** Call-to-action final con botón grande de instalación.

### footer-component.js

**Qué hace:** Footer con copyright y links a App y Admin.

---

## ⚙️ Módulos JavaScript

### 1. component-renderer.js

**Responsabilidad:** Renderizar componentes en el DOM.

**Funciones principales:**
- `renderAllComponents()` - Renderiza todos los componentes en `#app`
- `renderComponent(name, containerId)` - Renderiza un componente específico

**Uso:**
```javascript
import { renderAllComponents } from './modules/component-renderer.js';
renderAllComponents(); // Renderiza toda la página
```

### 2. platform-detector.js

**Responsabilidad:** Detectar el sistema operativo del usuario.

**Funciones principales:**
- `detectPlatform()` - Retorna 'android', 'ios' o 'desktop'
- `getPlatformType()` - Alias de detectPlatform
- `supportsPWA()` - Verifica si el navegador soporta PWA

**Uso:**
```javascript
import { detectPlatform } from './modules/platform-detector.js';

const platform = detectPlatform();
if (platform === 'android') {
    // Mostrar botón de instalación
}
```

### 3. pwa-installer.js

**Responsabilidad:** Manejar la instalación de PWA.

**Funcionalidades:**
- Captura el evento `beforeinstallprompt`
- Muestra/oculda botón de instalación según plataforma
- Maneja el click en el botón de instalación
- Auto-inicialización (Singleton pattern)

**Uso:**
```javascript
// Se auto-inicializa al importarse
import { pwaInstaller } from './modules/pwa-installer.js';

// Ya está funcionando, no necesita llamadas manuales
```

### 4. qr-generator.js

**Responsabilidad:** Generar códigos QR usando QRCode.js.

**Funciones principales:**
- `generateQRCode(url, elementId)` - Genera QR en un elemento
- `initQRGenerator()` - Inicializa el generador cuando DOM esté listo

**Uso:**
```javascript
import { initQRGenerator } from './modules/qr-generator.js';

// Generar QR después de renderizar componentes
setTimeout(() => initQRGenerator(), 100);
```

**Configuración:** `src/scripts/config/app-config.js → APP_CONFIG.qr`

### 5. tab-switcher.js

**Responsabilidad:** Sistema de pestañas para las instrucciones.

**Funcionalidades:**
- Detecta botones con `data-tab` attribute
- Cambia de pestaña al hacer click
- Maneja clases CSS `active`
- Auto-inicialización (Singleton pattern)

**Uso:**
```html
<!-- HTML -->
<button class="tab-btn" data-tab="android">Android</button>
<div id="android" class="tab-content active">...</div>
```

```javascript
// JS - Se auto-inicializa
import { tabSwitcher } from './modules/tab-switcher.js';
```

### 6. logger.js (Utility)

**Responsabilidad:** Sistema de logging que distingue desarrollo de producción.

**Funcionalidades:**
- Detecta automáticamente el ambiente (localhost = dev, resto = prod)
- `logger.log()` - Solo en desarrollo
- `logger.warn()` - Solo en desarrollo
- `logger.error()` - Siempre (errores críticos)

**Uso:**
```javascript
import { logger } from '../../utils/logger.js';

logger.log('🚀 App iniciada');        // Solo en localhost
logger.warn('⚠️ Warning');            // Solo en localhost
logger.error('❌ Error crítico');      // Siempre se muestra
```

---

## 🎨 Sistema de Estilos

Los estilos siguen una arquitectura modular CSS con imports.

### main.css (Punto de entrada)

```css
/* 1. Base */
@import 'base/reset.css';
@import 'base/variables.css';
@import 'base/typography.css';

/* 2. Layout */
@import 'layout/container.css';
@import 'layout/grid.css';
@import 'layout/footer.css';

/* 3. Components */
@import 'components/hero.css';
@import 'components/features.css';
@import 'components/buttons.css';
@import 'components/cards.css';
@import 'components/qr-code.css';
@import 'components/tabs.css';
@import 'components/cta-section.css';
```

### Variables CSS (variables.css)

Define colores, fuentes, espaciados:

```css
:root {
    /* Colores principales */
    --primary: #667eea;
    --primary-dark: #5568d3;
    --secondary: #764ba2;

    /* Tipografía */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    /* Espaciado */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 2rem;
    --spacing-lg: 3rem;
}
```

### Mobile First Approach

Todos los estilos están escritos mobile-first:

```css
/* Mobile (default) */
.hero {
    padding: 2rem 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .hero {
        padding: 4rem 2rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .hero {
        padding: 6rem 3rem;
    }
}
```

---

## ⚙️ Configuración

### content.js - Contenido de la Landing

**Ubicación:** `src/data/content.js`

Este archivo centraliza TODO el contenido textual y configuraciones de la landing:

```javascript
export const CONTENT = {
    // URLs de la aplicación
    urls: {
        app: 'https://zta.148.230.91.96.nip.io',
        admin: 'https://admin.zta.148.230.91.96.nip.io',
        qrDisplay: 'zta.148.230.91.96.nip.io'
    },

    // Sección Hero
    hero: {
        title: 'SUMAQ - Reporta Incidentes',
        description: 'Aplicación móvil...',
        buttons: { ... }
    },

    // Características
    features: [
        { icon: '📸', title: 'Foto y Ubicación', description: '...' },
        { icon: '🗺️', title: 'Mapa Interactivo', description: '...' },
        // ...
    ],

    // Instrucciones por plataforma
    howTo: {
        platforms: [
            {
                id: 'android',
                name: 'Android',
                steps: [ ... ]
            },
            // ...
        ]
    }
}
```

**Para modificar el contenido:**
1. Abre `src/data/content.js`
2. Edita el texto deseado
3. No toques la estructura, solo los valores
4. Rebuild del contenedor Docker

### app-config.js - Configuración Técnica

**Ubicación:** `src/scripts/config/app-config.js`

Configuración técnica de módulos:

```javascript
export const APP_CONFIG = {
    // URLs
    appUrl: 'https://zta.148.230.91.96.nip.io',
    adminUrl: 'https://admin.zta.148.230.91.96.nip.io',

    // QR Code
    qr: {
        elementId: 'qrcode',
        size: 180,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: 'H'  // H = High error correction
    },

    // PWA Install
    install: {
        buttonIds: ['installBtn', 'installBtnLarge']
    },

    // Tab System
    tabs: {
        buttonSelector: '.tab-btn',
        contentSelector: '.tab-content',
        activeClass: 'active'
    }
};
```

---

## 💻 Desarrollo Local

### Prerrequisitos

- Docker (recomendado) o nginx local
- Navegador moderno con soporte ES6 modules

### Opción 1: Docker (Recomendado)

```bash
# Desde el directorio raíz del proyecto
cd /ruta/a/SUMATE

# Build del contenedor de landing
docker compose build landing

# Levantar solo landing
docker compose up landing

# Acceder en: http://localhost:8000
# (Necesitas configurar nginx para redirigir al puerto correcto)
```

### Opción 2: Servidor Local Simple

```bash
cd landing

# Python 3
python -m http.server 8080

# Node.js (con npx)
npx serve -p 8080

# Acceder en: http://localhost:8080
```

### Live Reload (Desarrollo)

Para desarrollo activo, puedes usar:

```bash
# Con npm
npm install -g live-server
cd landing
live-server

# O con VS Code: Extension "Live Server"
```

### Debugging

Los logs solo se mostrarán en `localhost` gracias al logger:

```javascript
// En producción: silencio
// En localhost: logs completos
logger.log('🚀 Esto solo se ve en desarrollo');
```

Abre la consola del navegador (F12) para ver los logs.

---

## 🚀 Deployment

### Proceso Actual (Docker + nginx)

1. **Modificar código localmente**
2. **Commit y push a GitHub**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   git push origin main
   ```

3. **En el VPS:**
   ```bash
   cd /opt/sumak
   git pull origin main
   docker compose down
   docker compose build --no-cache nginx landing
   docker compose up -d
   ```

### Dockerfile

```dockerfile
FROM nginx:alpine

# Copiar archivos
COPY index.html /usr/share/nginx/html/index.html
COPY src/ /usr/share/nginx/html/src/
COPY public/ /usr/share/nginx/html/public/

# Configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Servir index.html para todas las rutas (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### URLs en Producción

- **Landing:** https://download.zta.148.230.91.96.nip.io
- **App:** https://zta.148.230.91.96.nip.io
- **Admin:** https://admin.zta.148.230.91.96.nip.io

---

## 🔧 Troubleshooting

### Problema: Logs aparecen en producción

**Causa:** El logger detecta que no es localhost.

**Solución:** Verifica que estés usando `logger.log()` y no `console.log()`.

```javascript
// ❌ Mal
console.log('mensaje');

// ✅ Bien
import { logger } from '../utils/logger.js';
logger.log('mensaje');
```

### Problema: Componentes no se renderizan

**Causa:** Posible error en imports de ES6 modules.

**Diagnóstico:**
1. Abre consola del navegador (F12)
2. Busca errores de imports
3. Verifica rutas relativas (`../../`)

**Solución:** Asegúrate que las rutas de imports sean correctas.

### Problema: QR Code no aparece

**Causa:** QRCode.js no se cargó antes de ejecutar el código.

**Solución:** Ya está resuelto con `setTimeout` en main.js:

```javascript
setTimeout(() => initQRGenerator(), 100);
```

### Problema: Tabs no funcionan

**Causa:** Los botones no tienen el atributo `data-tab` o el contenido no tiene el `id` correcto.

**Solución:** Verifica la estructura HTML:

```html
<!-- Botón -->
<button class="tab-btn" data-tab="android">Android</button>

<!-- Contenido -->
<div id="android" class="tab-content">...</div>
```

### Problema: Estilos no se aplican

**Causa:** Algún import CSS falló.

**Diagnóstico:**
1. Abre DevTools → Network tab
2. Busca archivos CSS con error 404
3. Verifica rutas en `main.css`

---

## 📝 Guía Rápida de Modificación

### Cambiar un Texto

1. Abre `src/data/content.js`
2. Busca la sección correspondiente
3. Edita el valor
4. Rebuild en producción

**Ejemplo:**
```javascript
// Cambiar el título
hero: {
    title: 'NUEVO TÍTULO AQUÍ',  // ← Editar aquí
    description: '...'
}
```

### Agregar una Nueva Característica

1. Abre `src/data/content.js`
2. Agrega un objeto al array `features`:

```javascript
features: [
    // ... características existentes
    {
        icon: '🎯',  // Emoji o SVG
        title: 'Nueva Característica',
        description: 'Descripción de la característica'
    }
]
```

### Cambiar Colores

1. Abre `src/styles/base/variables.css`
2. Modifica las variables CSS:

```css
:root {
    --primary: #667eea;      /* Color principal */
    --secondary: #764ba2;     /* Color secundario */
}
```

### Agregar un Nuevo Componente

1. Crea archivo en `src/components/`:
   ```javascript
   // mi-componente.js
   import { CONTENT } from '../data/content.js';

   export function renderMiComponente() {
       return `
           <section class="mi-componente">
               <h2>Mi Componente</h2>
           </section>
       `;
   }
   ```

2. Importa en `component-renderer.js`:
   ```javascript
   import { renderMiComponente } from '../../components/mi-componente.js';

   export function renderAllComponents() {
       const componentsHTML = `
           ${renderHero()}
           ${renderMiComponente()}  // ← Agregar aquí
           ${renderFeatures()}
           // ...
       `;
   }
   ```

3. Crea estilos en `src/styles/components/mi-componente.css`

4. Importa en `main.css`:
   ```css
   @import 'components/mi-componente.css';
   ```

---

## 🎓 Conceptos Clave

### ES6 Modules

Esta landing usa módulos nativos de JavaScript (no bundlers como webpack):

```javascript
// Exportar
export function miFuncion() { }
export const miVariable = 'valor';

// Importar
import { miFuncion } from './archivo.js';
```

**Ventajas:**
- Sin build step necesario
- Carga más rápida en navegadores modernos
- Mejor para debugging

### Progressive Web App (PWA)

La landing puede instalarse como app nativa gracias a:

1. **manifest.json** (si existe)
2. **Service Worker** (si existe)
3. **beforeinstallprompt** event (manejado por pwa-installer.js)

### Singleton Pattern

Algunos módulos se auto-inicializan como singletons:

```javascript
// tab-switcher.js
class TabSwitcher {
    constructor() {
        this.init();  // Auto-inicialización
    }
}

export const tabSwitcher = new TabSwitcher();  // Singleton
```

---

## 📚 Referencias

- **ES6 Modules:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **PWA:** https://web.dev/progressive-web-apps/
- **CSS Variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **QRCode.js:** https://github.com/davidshimjs/qrcodejs

---

## 📧 Soporte

Para problemas o preguntas:
- Revisa esta documentación primero
- Verifica la consola del navegador (F12)
- Revisa los logs en desarrollo (localhost)

---

**Última actualización:** 2025-10-21
**Versión:** 3.0 (Modular Architecture)
