FROM node:20-alpine AS development

ARG NODE_ENV=development

WORKDIR /usr/src/app

RUN npm install -g yarn

COPY package.json yarn.lock ./
COPY yarn.lock ./
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

COPY src src

RUN yarn install --frozen-lockfile

CMD ["yarn", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

RUN npm install -g pm2 yarn

COPY --from=development /usr/src/app/node_modules node_modules
COPY --from=development /usr/src/app/package.json package.json
COPY --from=development /usr/src/app/yarn.lock yarn.lock
COPY --from=development /usr/src/app/src src
COPY --from=development /usr/src/app/tsconfig.json tsconfig.json
COPY --from=development /usr/src/app/tsconfig.build.json tsconfig.build.json
COPY --from=development /usr/src/app/nest-cli.json nest-cli.json

RUN yarn build

COPY ecosystem.config.js ecosystem.config.js

RUN mkdir -p /var/log/pm2

ENV NODE_ENV=production

CMD ["sh", "-c", "pm2-runtime start ecosystem.config.js"]