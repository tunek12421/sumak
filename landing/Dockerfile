FROM nginx:alpine

# Copiar archivos principales
COPY index.html /usr/share/nginx/html/index.html

# Copiar estructura modular
COPY src/ /usr/share/nginx/html/src/
COPY public/ /usr/share/nginx/html/public/

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
