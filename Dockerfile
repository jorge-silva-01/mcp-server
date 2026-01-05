FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

CMD ["node", "dist/index.js"]
