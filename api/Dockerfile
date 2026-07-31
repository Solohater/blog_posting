FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --fetch-retries=5 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000

COPY src ./src

EXPOSE 3000

CMD ["node", "--experimental-strip-types", "--experimental-sqlite", "src/server.js"]
