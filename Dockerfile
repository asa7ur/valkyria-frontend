# --- Etapa 1: compilar la app Angular ---
FROM node:22 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx ng build --configuration production

# --- Etapa 2: servir los estáticos con nginx ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/valkyria-frontend/browser /usr/share/nginx/html
EXPOSE 80
