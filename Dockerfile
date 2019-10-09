FROM zenika/alpine-chrome:with-node
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --only=prod
COPY . ./
EXPOSE 3000
RUN chmod +rwx server/www
CMD ["npm", "run","start"]
