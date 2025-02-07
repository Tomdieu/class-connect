# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

# Stage 2: Create a production-ready image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package.json and node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
