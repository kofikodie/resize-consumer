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

# Remove unnecessary devDependencies for a cleaner dist
RUN npm prune --production

# Stage 2: Create production-ready image with distroless
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

ENV RUNNING_ENV="prod"

# Command to run your app
CMD ["src/index.js"]
