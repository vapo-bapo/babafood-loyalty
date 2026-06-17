FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

COPY . .

ENV PORT=3000
ENV DATA_DIR=/data

EXPOSE 3000

CMD ["node", "backend/server.js"]
