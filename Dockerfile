# Stage 0: Base image with pnpm enabled via corepack
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1: Build dependencies and app
FROM base AS build
WORKDIR /usr/src/app

# Copy lockfile and package.json first to leverage Docker cache
COPY package.json pnpm-lock.yaml* ./

# Use cache mount for pnpm store to speed up installations across builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code and build the application
COPY . .
RUN pnpm run build

# Stage 2: Production image (minimal and secure)
FROM base AS app
# Set the working directory
WORKDIR /usr/src/app

# Copy only necessary files from the build stage (production dependencies are already in node_modules due to pnpm's symlinking)
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist
# If you have public or other necessary directories, copy them here too
# COPY --from=build /usr/src/app/public /usr/src/app/public

# Expose port and start the application
EXPOSE 6500
CMD [ "node", "dist/index.js" ]

