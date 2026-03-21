# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_TELEGRAM_BOT_NAME
ARG VITE_SENTRY_DSN
ARG VITE_ENVIRONMENT
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_TELEGRAM_BOT_NAME=$VITE_TELEGRAM_BOT_NAME
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
