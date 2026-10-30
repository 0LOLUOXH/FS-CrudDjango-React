# ==============================================================================
# DOCKERFILE HARDENED - DJANGO BACKEND (FUSION SOLAR)
# CIS Benchmark & OWASP Container Security Guidelines
# ==============================================================================

# Etapa 1: Build y dependencias
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --prefix=/install -r requirements.txt

# Etapa 2: Runtime seguro no privilegiado
FROM python:3.12-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/install/bin:$PATH" \
    PYTHONPATH="/install/lib/python3.12/site-packages:$PYTHONPATH"

# Instalar dependencias de runtime y herramientas de PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar paquetes instalados desde la etapa builder
COPY --from=builder /install /install

# Crear usuario y grupo de sistema sin privilegios (Principio de Menor Privilegio)
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser

# Copiar código fuente
COPY . /app

# Crear directorio de backups y asegurar permisos
RUN mkdir -p /app/backups /app/staticfiles && \
    chown -R appuser:appgroup /app

# Ejecutar como usuario no root (CWE-250)
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/fs/csrf/ || exit 1

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
