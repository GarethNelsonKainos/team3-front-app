# Dockerfile for team3-front-app
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Build TypeScript
RUN npm run build || true

# Expose the port
EXPOSE 3001

# Start the app
CMD ["npm", "run", "start"]