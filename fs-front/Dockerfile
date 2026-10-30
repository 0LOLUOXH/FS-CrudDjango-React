# ==============================================================================
# DOCKERFILE HARDENED - REACT FRONTEND (FUSION SOLAR)
# CIS Benchmark & OWASP Container Security Guidelines
# ==============================================================================

# Etapa 1: Build de la SPA con Node
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Etapa 2: Servidor Web Nginx ligero y no privilegiado
FROM nginxinc/nginx-unprivileged:alpine-slim AS runner

# Copiar configuración personalizada de nginx con headers de seguridad
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 8080;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Cabeceras de endurecimiento HTTP
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000;" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Desactivar logging de assets comunes para reducir ruido
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
}
EOF

# Copiar build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Ejecutar como usuario no root nativo del contenedor unprivileged
USER 101

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
