FROM node:16-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV DB_URL=172.27.0.54
# Dont forget to set the other ENV variables when running the container
EXPOSE 3000
CMD npm run prod
