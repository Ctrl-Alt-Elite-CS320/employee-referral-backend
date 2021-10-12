FROM node:14-alpine

#Setting work directory
WORKDIR /srv/employee-referral-backend

#Copying the package.json file
COPY package*.json ./

#Install the apps
RUN npm install

#Open port
EXPOSE 4000

#Copying the code over
COPY . .

#Command to run
CMD [ "node", "server.js" ]
