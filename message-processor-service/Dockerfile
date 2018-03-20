FROM node:latest
WORKDIR /usr/src/message-processor
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9099
CMD [ "npm", "start" ]
