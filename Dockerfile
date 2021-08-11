FROM node:14-alpine

WORKDIR /app
ADD . /app/

RUN apk update && apk upgrade

RUN yarn install --silent

RUN yarn heroku-postbuild


# start the app
CMD [ "yarn", "start" ]