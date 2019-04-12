#!/bin/sh

echo "Start paradox-api with UID=${PUID} (${U}), GID=${PGID} (${G}) in ${WD}"

userdel -f node

groupadd -g $PGID $G
useradd -d "/${WD}" -u $PUID -g $PGID $U

if [ -z "$(ls -A /data)" ]; then
  cp -r ${WD}/dist/data-origin/* /data/
  chown -R $U\:$G /data
fi

sudo -i -u $U bash -c 'cd '${WD}'; npm start "'$@'"'
