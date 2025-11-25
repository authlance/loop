FROM node:20-bullseye

# Install dependencies first
RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    python3-pip \
    ca-certificates \
    curl \
    gnupg \
    nginx \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG NPM_AUTH_TOKEN
RUN echo "registry=https://registry.npmjs.org/" > /root/.npmrc && \
    echo "@authlance:registry=https://npm.pkg.github.com/" >> /root/.npmrc && \
    echo "//npm.pkg.github.com/:_authToken=${NPM_AUTH_TOKEN}" >> /root/.npmrc && \
    echo "always-auth=true" >> /root/.npmrc

COPY package.json /app/package.json
COPY lerna.json /app/lerna.json
COPY yarn.lock /app/yarn.lock
COPY examples/browser /app/examples/browser
COPY configs /app/configs
COPY ./deployment/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./deployment/nginx/duna.conf /etc/nginx/sites-enabled/duna.conf
COPY deployment/startup/start-duna.sh /app/start-duna.sh

RUN rm examples/browser/.env && mv examples/browser/.env-production examples/browser/.env && rm -rf deployment

# ensure frontend is built in a minified way
RUN  yarn install --frozen-lockfile

RUN cd examples/browser && \
  mkdir -p lib/styles && \
  npx tailwindcss -i ./src/styles/index.css \
    -o ./lib/styles/output.css \
    --content "./src-gen/frontend/**/*.{js,ts,jsx,tsx}" \
    --content "../../node_modules/@authlance/**/*.{js,ts,jsx,tsx}" && \
  rm -f lib/styles/index.css && \
  mv lib/styles/output.css lib/styles/index.css && \
  rm ./lib/*.js.map && \
  rm ./lib/*.js.map.gz && \
  rm ./lib/*.css.map && \
  rm ./lib/*.css.map.gz

RUN  yarn run build:prod

RUN rm /root/.npmrc && rm -rf /app/configs

RUN chmod +x /app/start-duna.sh

RUN groupadd -g 102 nginx && \
    useradd -r -u 101 -g 102 -s /sbin/nologin -d /var/cache/nginx nginx

EXPOSE 3000

# Start command
CMD ["/app/start-duna.sh"]
