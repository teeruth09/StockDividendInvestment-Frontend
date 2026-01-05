FROM node:20-alpine

# install dependencies ที่จำเป็นสำหรับบาง library
RUN apk add --no-cache libc6-compat

WORKDIR /app

# copy package files
COPY package*.json ./

#install dependencies (npm install)
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]