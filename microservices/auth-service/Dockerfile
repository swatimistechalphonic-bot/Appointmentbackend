FROM node:18-alpine

WORKDIR /app

# Required for native npm packages like bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
