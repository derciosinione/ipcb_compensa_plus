FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_IDENTITY_API_URL=http://localhost:5002
ARG VITE_CORE_API_URL=http://localhost:5001
ENV VITE_IDENTITY_API_URL=$VITE_IDENTITY_API_URL
ENV VITE_CORE_API_URL=$VITE_CORE_API_URL

RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
