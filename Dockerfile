FROM ghcr.io/puppeteer/puppeteer:latest 
USER root

WORKDIR /usr/src/app
COPY package.json package-lock.json tsconfig.json ./
COPY ./src ./src

RUN npm install
RUN npm run build

EXPOSE 3000/tcp
ENTRYPOINT ["npm", "run", "start"]