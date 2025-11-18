# Production container for serving the MarAI static prototype on Railway
FROM nginx:1.27-alpine

# Copy custom nginx config to serve static assets and enable gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static frontend assets
COPY frontend /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
