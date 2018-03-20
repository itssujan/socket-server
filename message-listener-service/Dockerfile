FROM node:latest
WORKDIR /usr/src/message-listener
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9091
CMD [ "npm", "start" ]
