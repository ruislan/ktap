FROM node:20-alpine
ENV TZ=Asia/Shanghai
ENV NODE_ENV production
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /app
COPY . .

RUN yarn install
RUN yarn prisma generate
EXPOSE 8000
ENTRYPOINT ["yarn", "dev:seed"]
