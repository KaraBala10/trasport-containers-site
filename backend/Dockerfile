FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including WeasyPrint requirements
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libgobject-2.0-0 \
    libglib2.0-0 \
    libcairo2 \
    libgdk-pixbuf-xlib-2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=300 --retries=5 -r requirements.txt

# Copy backend directory
COPY backend/ ./backend/
# Copy manage.py
COPY manage.py .

# Expose port
EXPOSE 8000

# Collect static files (only in production)
# RUN python manage.py collectstatic --noinput

# Default command (can be overridden in docker-compose.yml)
# For development: python manage.py runserver 0.0.0.0:8000
# For production: gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
CMD sh -c "python manage.py makemigrations && python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"

