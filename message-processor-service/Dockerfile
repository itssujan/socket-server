FROM node:latest
WORKDIR /usr/src/app
COPY package*.json /usr/src/app
RUN npm install -g nodemon
RUN npm install
COPY . .
EXPOSE 9099
CMD [ "node", "index.js" ]
