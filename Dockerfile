FROM node:alpine3.18 as build

#build app
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

#serve with nginx
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=build /app/dist .
EXPOSE 5173
ENTRYPOINT [ "nginx", "-g", 'daemon off;' ]