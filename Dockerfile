FROM node:18 as download
WORKDIR /opt/node_app
RUN wget https://github.com/excalidraw/excalidraw/archive/refs/tags/v0.17.3.tar.gz -O excalidraw.tgz
RUN tar -zvxf excalidraw.tgz
RUN ls .
RUN mv excalidraw-* excalidraw

FROM node:18 as build
ARG HOSTNAME
ENV NODE_ENV development
ENV VITE_APP_BACKEND_V2_GET_URL https://${HOSTNAME}:3000/api/v2/
ENV VITE_APP_BACKEND_V2_POST_URL https://${HOSTNAME}:3000/api/v2/post/
ENV VITE_APP_WS_SERVER_URL wss://${HOSTNAME}:3002
# collaboration WebSocket server (https://github.com/excalidraw/excalidraw-room)
ENV VITE_APP_PLUS_LP https://plus.excalidraw.com
ENV VITE_APP_PLUS_APP https://app.excalidraw.com
ENV VITE_APP_AI_BACKEND https://${HOSTNAME}:3015
WORKDIR /opt/node_app
COPY --from=download /opt/node_app/excalidraw/package.json /opt/node_app/excalidraw/yarn.lock ./
RUN yarn --ignore-optional --network-timeout 600000
COPY --from=download /opt/node_app/excalidraw/ .
RUN yarn build:app:docker

FROM nginx:latest
COPY --from=build /opt/node_app/build /usr/share/nginx/html
ADD certs/nginx.crt /etc/nginx/ssl/nginx.crt
ADD certs/nginx.key /etc/nginx/ssl/nginx.key
ADD nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443
EXPOSE 3000
EXPOSE 3002