# Use official node image as the base image
FROM node:20-alpine3.19 as build

# Set the working directory
RUN mkdir /usr/local/app
WORKDIR /usr/local/app

# Add the source code to app
COPY . /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npm run build --base-href="/"

# Stage 2: Serve app with nginx server

# Use official nginx image as the base image
FROM nginx:1.21.6

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/demo1 /usr/share/nginx/html
COPY --from=build /usr/local/app/deployment/default.conf /etc/nginx/conf.d/default.conf

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.prod.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]

# Expose port 80

EXPOSE 80
