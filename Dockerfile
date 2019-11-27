FROM zenika/alpine-chrome:with-node
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --only=prod
COPY . ./
EXPOSE 3000
USER root
RUN chmod +rwx server/www
RUN node -v
CMD ["npm", "run","start"]
