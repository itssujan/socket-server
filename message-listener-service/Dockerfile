FROM node:latest
WORKDIR /usr/src/app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 9090
CMD [ "node", "index.js" ]
