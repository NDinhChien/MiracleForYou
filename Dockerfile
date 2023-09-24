FROM node:18
USER node

# Create app directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Install app dependencies
COPY --chown=node:node package*.json .
RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY --chown=node:node . .

EXPOSE 3000
CMD [ "npm", "start" ]


# Build an image docker
# docker build -t node-app .

# Run image
# docker run -p 8080:3000 -d node-app

# Get container ID
# $ docker ps

# Print app output
# $ docker logs <container id>

# Enter the container
# $ docker exec -it <container id> /bin/bash

# Kill our running container
# $ docker kill <container id>

# Access your app
# http://localhost:8080