FROM node:14-alpine

WORKDIR /srv/employee-referral-backend

#Copying the code over
COPY . .

#Copying the package.json file
COPY package*.json ./

#Install the apps
RUN npm install

#Open port
EXPOSE 4000

#Command to run
CMD [ "node", "server.js" ]
