# Stage 1: Build the frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Issuer settings are baked into the bundle at build time
ARG VITE_ISSUER_API_TOKEN
ARG VITE_ISSUER_TEMPLATE_ID
ARG VITE_ISSUER_ORG_CODE
ARG VITE_ISSUER_EMAIL
ENV VITE_ISSUER_API_TOKEN=$VITE_ISSUER_API_TOKEN \
    VITE_ISSUER_TEMPLATE_ID=$VITE_ISSUER_TEMPLATE_ID \
    VITE_ISSUER_ORG_CODE=$VITE_ISSUER_ORG_CODE \
    VITE_ISSUER_EMAIL=$VITE_ISSUER_EMAIL

# Build the app (output goes to /app/dist)
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config (optional, see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
