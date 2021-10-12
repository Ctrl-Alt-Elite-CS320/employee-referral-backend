FROM node:14-alpine

LABEL author="Thien Tran" maintainer="contact@tommytran.io"

#Setting work directory
WORKDIR /srv/employee-referral-backend

#Copying the code over
COPY . .

#Install the apps
RUN npm install --only=production

#Open port
EXPOSE 4000

#Command to run
CMD [ "node", "index.js" ]
