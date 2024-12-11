# CÀI ĐẶT PACKAGE
FROM node:18.20.4-alpine3.20 as nodemodule
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

COPY . .

# PULL GIT SUBMODULES, LƯU Ý CÁI NÀY QUAN TRỌNG
# Install node modules
RUN npm install

# BUILD CODE
FROM node:18.20.4-alpine3.20 as builder
WORKDIR /app

# Copy all project files from the current directory
COPY . .
COPY --from=nodemodule /app/src/submodules ./src/submodules
# Copy node_modules from nodemodule stage
COPY --from=nodemodule /app/node_modules ./node_modules
# Build the code
RUN npm run build

# RUNNER STAGE
FROM node:18.20.4-alpine3.20 as runner
WORKDIR /app

# THÔNG TIN NGƯỜI VIẾT
LABEL maintainer_name="ybin.nguyen"
LABEL maintainer_email="ybin.nguyen@estuary.solutions"

# CÀI ĐẶT MUỐI GIỜ
ARG DEBIAN_FRONTEND=noninteractive
RUN apk update && apk add tzdata
RUN ln -sf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime

# Copy built app and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/ecdsa.key ./ecdsa.key
# COPY --from=builder /app/ecdsa.pub ./ecdsa.pub
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/run-container.sh ./run-container.sh
COPY --from=builder /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy node_modules from nodemodule stage
COPY --from=nodemodule /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Start the container
CMD ["/bin/sh", "run-container.sh"]
