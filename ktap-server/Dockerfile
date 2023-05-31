FROM node:18-alpine

ENV TZ=Asia/Shanghai
ENV NODE_ENV production

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY . /usr/src/ktap-server
WORKDIR /usr/src/ktap-server
RUN yarn install
RUN yarn prisma db push
# RUN yarn prisma db seed
RUN node prisma/seed.steam.js

EXPOSE 8000
ENTRYPOINT ["node", "server.js"]
