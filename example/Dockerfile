# Stage 1: Base with all dependencies and source code
FROM node:24-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy everything (src, test, jest config, etc.)
COPY . .

# Stage 2: Production Build
FROM development AS build
RUN npm run build

# Stage 3: Slim Production Runner
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000