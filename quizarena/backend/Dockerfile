# Backend Dockerfile - QuizArena API
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Persist the SQLite file outside the image layer
VOLUME ["/app/src/database"]

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
