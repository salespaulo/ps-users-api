FROM node:alpine
EXPOSE 8080
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY ./public /usr/src/app
CMD [ "node", "app.js" ]
