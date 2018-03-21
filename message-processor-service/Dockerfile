FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -g nodemon
RUN npm install
COPY . .
EXPOSE 9099
CMD [ "node", "index.js" ]
