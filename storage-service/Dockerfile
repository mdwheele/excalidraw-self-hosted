FROM node:18
WORKDIR /opt/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "www.js"]