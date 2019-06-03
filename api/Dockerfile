FROM node:12

# Create app directory
WORKDIR /opt/app/

COPY ./package*.json ./

RUN npm install -g pm2
RUN npm i

COPY . .

EXPOSE 3000

# Run command "npm start"
ENTRYPOINT [ "npm", "run", "start:prod" ]
