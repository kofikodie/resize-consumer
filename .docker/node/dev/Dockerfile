# Stage 1: Install dependencies and build the app
FROM node:22-alpine3.19 AS build

WORKDIR /app

# Copy only package files and install dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript project
RUN npm run build
