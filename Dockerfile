FROM node:10.12.0-alpine

ARG API_URL
ARG IS_STAGING
ARG BACKEND_API_URL

ENV IS_STAGING $IS_STAGING
ENV API_URL $API_URL
ENV BACKEND_API_URL $BACKEND_API_URL
ENV TRANSIFEX_API_KEY 3a7e3362bece4f359c842ec913c60daf
ENV GOOGLE_MAPS_API_KEY AIzaSyC0-DiUTooA6ktMyTj0_dtoQFiF6cLSVQE
ENV GOOGLE_ANALYTICS UA-149440221-1
ENV ANALYSIS_URL https://analytics.wildlifeinsights.org
ENV SECRET_KEY N6Z1m2jt2fNJmK4DtsxdEzU4hjyKaVmk
ENV GOOGLE_RECAPTCHA_KEY 6LfjexcaAAAAAHSTHxK48Z7bAuSr9UqR3olc7AH_

RUN apk update && apk add --no-cache \
    build-base gcc bash git

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Bundle app source
COPY . /usr/src/app
RUN yarn build

CMD ["yarn", "start"]
