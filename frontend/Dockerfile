# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the application code
COPY . .

# Generate the production build
RUN npm run build

# Stage 2: Create a production-ready image
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Install only production dependencies in the runner stage
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000