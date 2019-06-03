FROM node:12

WORKDIR /opt/app

COPY . .

RUN npm i

ENTRYPOINT [ "npm", "run", "build" ]
