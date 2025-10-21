FROM nginx:alpine

# Copiar archivos principales
COPY index.html /usr/share/nginx/html/index.html

# Copiar archivos PWA
COPY manifest.json /usr/share/nginx/html/manifest.json
COPY service-worker.js /usr/share/nginx/html/service-worker.js
COPY icon-192.png /usr/share/nginx/html/icon-192.png
COPY icon-512.png /usr/share/nginx/html/icon-512.png

# Copiar estructura modular
COPY src/ /usr/share/nginx/html/src/
COPY public/ /usr/share/nginx/html/public/

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
