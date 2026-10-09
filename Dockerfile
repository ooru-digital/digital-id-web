# Stage 1: Build the frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Non-secret issuer settings are baked into the bundle at build time.
# The API token is NOT a build argument: nginx reads ISSUER_API_TOKEN at runtime.
ARG VITE_ISSUER_TEMPLATE_ID
ARG VITE_ISSUER_ORG_CODE
ARG VITE_ISSUER_EMAIL
ENV VITE_ISSUER_TEMPLATE_ID=$VITE_ISSUER_TEMPLATE_ID \
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

# The nginx image renders templates into conf.d at startup, substituting only env vars
# matching the filter, so nginx's own $variables are left alone.
# ISSUER_API_TOKEN must be set when the container starts, or nginx refuses to start.
ENV NGINX_ENVSUBST_FILTER=^ISSUER_
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
