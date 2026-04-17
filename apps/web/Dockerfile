FROM node:20-alpine

WORKDIR /app

# Copy root lockfile if it's a workspace, otherwise copy web's
COPY ../../package*.json ./
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
