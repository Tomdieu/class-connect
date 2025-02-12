# Utiliser l'image officielle de Python comme image parente
FROM python:3.11
LABEL authors="ivantom"

# Set Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV INSIDE_DOCKER=1

# Create a virtual environment
RUN python -m venv /opt/venv

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt ./

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copier le reste des fichiers de votre application dans le conteneur
COPY . .

# Copy the Google service account file
COPY secret/google-secret.json /app/secret/google-secret.json

# Copier le entrypoint et start script, convertir les fins de ligne et les rendre exécutables

COPY ./docker/prod/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//g' /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY ./docker/prod/start.sh /start.sh
RUN sed -i 's/\r$//g' /start.sh
RUN chmod +x /start.sh

# Make port 8001 available to the world outside this container
EXPOSE 8001

# Define environment variable
ENV DJANGO_SETTINGS_MODULE=backend.settings