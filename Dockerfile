# ---- Backend Build ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/

# ---- Backend Dependencies ----
FROM base AS backend-deps
RUN apk add --no-cache openssl
COPY package-lock.json* ./
RUN npm install -g npm@latest
COPY shared/ ./shared/
COPY backend/ ./backend/
RUN cd backend && npm install
RUN npx prisma generate --schema=backend/prisma/schema.prisma

# ---- Backend Build & Run ----
FROM backend-deps AS backend
COPY backend/ ./backend/
RUN cd backend && npm run build
EXPOSE 3000
CMD ["node", "backend/dist/main.js"]

# ---- Frontend Build ----
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ---- Frontend Nginx ----
FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
