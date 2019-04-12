FROM node:11

ARG U=paradox
ARG G=$U

ENV WD=/$U
ENV U=$U
ENV G=$G
ENV PUID=1000
ENV PGID=1000

RUN echo " U : $U\n G : $G\nWD : $WD"

RUN apt-get update && \
    apt-get -y install sudo

WORKDIR $WD
ENTRYPOINT ["./start.sh"]
EXPOSE 3000

# Build project
COPY . .
RUN npm install
RUN npm run build

# Data dir
RUN mv dist/data dist/data-origin
RUN mkdir /data
RUN ln -s /data $WD/dist/data

# Startup script
COPY src/docker/* .
RUN chmod +x *.sh

