# 1. Base image con Node
FROM node:20-alpine AS build

# 2. Configurar directorio local
WORKDIR /app

# 3. Copiar package files e instalar dependencias
COPY package.json ./
RUN npm install --no-package-lock

# 4. Copiar código fuente
COPY . .

# 5. Build del proyecto Vite
RUN npm run build

# 6. Imagen final de producción (Nginx ligero)
FROM nginx:alpine

# 7. Copiar estáticos al directorio de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# 8. Copiar config de nginx para SPA (Single Page Application)
RUN echo "server { listen 8080; location / { root /usr/share/nginx/html; index index.html index.htm; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# 9. Exponer puerto que usa Cloud Run
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
