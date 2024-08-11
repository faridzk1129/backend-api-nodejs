FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY .env .env

RUN sed -i 's#/Users/farid/Desktop/bangkit/projek capstone/backend/config/fitsync-backend-firebase-adminsdk-sw7qo-63263ca455.json#/usr/src/app/config/fitsync-backend-firebase-adminsdk-sw7qo-63263ca455.json#' .env

# Install bcrypt untuk lingkungan produksi
RUN npm rebuild bcrypt --build-from-source

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD [ "node", "src/index.js" ]
