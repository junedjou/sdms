FROM node:20-alpine

WORKDIR /app

# Install dependencies dulu (cache layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Buat direktori log
RUN mkdir -p logs

EXPOSE 3000

CMD ["node", "src/server.js"]
