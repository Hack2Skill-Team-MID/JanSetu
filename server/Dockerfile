FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate prisma client
RUN npx prisma generate

RUN npm run build

EXPOSE 8080
CMD ["npm", "start"]
