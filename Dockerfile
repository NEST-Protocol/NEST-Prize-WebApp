#a sample dockerfile for NEXT.js web app
FROM node:12.18.3-alpine3.9
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
