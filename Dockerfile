FROM node:14-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

RUN apk update && apk upgrade

COPY ./nuxt-app /usr/src/nuxt-app/
RUN yarn install --silent

RUN yarn heroku-postbuild


# start the app
CMD [ "yarn", "start" ]