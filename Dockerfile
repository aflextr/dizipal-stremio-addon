FROM node:20-alpine

RUN apk add --no-cache curl unzip

WORKDIR /root

RUN curl -L -o main.zip https://github.com/aflextr/dizipal-stremio-addon/archive/refs/heads/main.zip

RUN unzip main.zip && rm main.zip

WORKDIR /root/dizipal-stremio-addon-main

RUN npm install

CMD ["node", "index.js"]
