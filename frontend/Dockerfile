# Use an official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install -f

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a smaller image for production (optional optimization)
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Expose port 3000 to the outside world
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "start"]