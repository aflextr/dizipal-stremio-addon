FROM node:20-alpine

WORKDIR /root

COPY . .

RUN npm install

CMD ["node", "index.js"]
