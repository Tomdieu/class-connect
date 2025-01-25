# Use an official Python runtime as a parent image
FROM python:3.10.13-slim-bullseye
LABEL authors="ivantom"

# Set Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV INSIDE_DOCKER=1

# Create a virtual environment
RUN python -m venv /opt/venv

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install requirements
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r /app/requirements.txt

RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy the current directory contents into the container at /app
COPY . /app/

# Migrate the database
RUN python manage.py makemigrations && python manage.py migrate

# Copy the Google service account file
COPY secret/google-secret.json /app/secret/google-secret.json

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Collect Static 
RUN python manage.py collectstatic --noinput