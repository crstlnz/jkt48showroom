FROM node:14-alpine

WORKDIR /app
ADD . /app/

RUN npm install --silent

RUN npm heroku-postbuild

CMD [ "npm", "start" ]