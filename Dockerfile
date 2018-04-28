FROM node:alpine

# RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
# RUN npm install --quiet node-gyp -g

WORKDIR /usr/src/app

# COPY *.gyp ./
COPY package*.json ./
COPY process.yml ./
COPY *.js ./
# COPY *.cc ./
COPY .env ./

ENV NPM_CONFIG_LOGLEVEL warn
RUN npm i
# RUN node-gyp configure
# RUN node-gyp build
RUN npm install pm2 -g
RUN ls -l
EXPOSE 8080
CMD ["pm2-runtime", "process.yml"]



