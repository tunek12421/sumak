# 🎨 Iconos PWA para SUMAQ Landing

La PWA necesita iconos en formato PNG para funcionar correctamente.

## 📋 Iconos Requeridos

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `icon-192.png` | 192x192px | Icono principal Android |
| `icon-512.png` | 512x512px | Splash screen Android |

---

## 🚀 Opción 1: Generar Iconos Rápidamente (Recomendado)

### Usando una herramienta online:

1. **PWA Asset Generator** (https://www.pwabuilder.com/imageGenerator)
   - Sube un logo cuadrado (mínimo 512x512px)
   - Descarga los iconos generados
   - Copia `icon-192.png` y `icon-512.png` a `/landing/`

2. **Favicon Generator** (https://realfavicongenerator.net/)
   - Sube tu logo
   - Genera iconos PWA
   - Descarga el paquete
   - Extrae y copia los archivos necesarios

---

## 🎨 Opción 2: Crear Iconos con GIMP/Photoshop

### Especificaciones:

**icon-192.png:**
- Tamaño: 192x192 pixels
- Formato: PNG con transparencia
- Colores: RGB
- Resolución: 72 DPI

**icon-512.png:**
- Tamaño: 512x512 pixels
- Formato: PNG con transparencia
- Colores: RGB
- Resolución: 72 DPI

### Pasos en GIMP:

1. Crear nuevo documento: 512x512px
2. Diseñar el icono (centrado, con padding de 20px)
3. Exportar como PNG
4. Crear versión 192x192 (Imagen → Escalar imagen)

---

## 🔧 Opción 3: Iconos Temporales con ImageMagick

Si tienes ImageMagick instalado, puedes generar iconos temporales:

```bash
# Navegar al directorio landing
cd /home/tunek/Proyectos/SUMATE/landing

# Generar icono temporal 192x192
convert -size 192x192 xc:#667eea \
  -gravity center \
  -pointsize 120 \
  -fill white \
  -annotate +0+0 "S" \
  icon-192.png

# Generar icono temporal 512x512
convert -size 512x512 xc:#667eea \
  -gravity center \
  -pointsize 320 \
  -fill white \
  -annotate +0+0 "S" \
  icon-512.png
```

---

## 📱 Opción 4: Usar SVG como Placeholder (Temporal)

Para development rápido, puedes usar iconos SVG inline:

```bash
cd /home/tunek/Proyectos/SUMATE/landing

# Crear icon-192.png (placeholder)
cat > icon-192.svg << 'EOF'
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" fill="#667eea"/>
  <text x="96" y="130" font-size="120" text-anchor="middle" fill="white" font-family="Arial, sans-serif">
    S
  </text>
</svg>
EOF

# Convertir SVG a PNG (si tienes inkscape o rsvg-convert)
rsvg-convert -w 192 -h 192 icon-192.svg -o icon-192.png
rsvg-convert -w 512 -h 512 icon-192.svg -o icon-512.png
```

---

## ✅ Verificar que los Iconos Funcionan

Después de copiar los iconos:

1. **En Chrome DevTools:**
   - F12 → Application tab
   - Manifest section
   - Verifica que los iconos aparezcan sin errores

2. **Probar instalación:**
   - Abre la landing en Chrome Android
   - Debería aparecer el botón "Instalar"
   - Los iconos deberían mostrarse correctamente

---

## 🎯 Recomendación Final

**Para producción:**
- Usa el logo oficial de SUMAQ
- Genera iconos profesionales con PWA Builder
- Optimiza los PNG con TinyPNG o similar

**Para testing rápido:**
- Usa los iconos temporales generados con ImageMagick
- Funcionarán perfectamente para probar la instalación PWA

---

## 📍 Ubicación de los Archivos

```
landing/
├── icon-192.png     ← Aquí
├── icon-512.png     ← Aquí
├── manifest.json    ✅ Ya creado
├── service-worker.js ✅ Ya creado
└── index.html       ✅ Ya actualizado
```

---

**Nota:** Los iconos son **obligatorios** para que Chrome muestre el prompt de instalación. Sin ellos, la PWA no funcionará.
