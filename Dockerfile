FROM node:lts-alpine as base-stage

WORKDIR /app
RUN yarn add express

FROM base-stage as intermediary-builder-stage

COPY package.json package.json
RUN yarn

COPY . .
RUN yarn build

FROM base-stage
WORKDIR /app
COPY --from=intermediary-builder-stage /app/build ./build
COPY --from=intermediary-builder-stage /app/index.js ./index.js
EXPOSE 3000
CMD ["node", "index.js"]