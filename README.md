# Paradox API for IP150

The Paradox API allow you to read/write areas state of you Paradox system.

A web server is exposed an you can use REST operation to manage our Alarm.

**The Paradox API needs the IP150 module to connect to your Paradox system.**

## Configuration

Edit the file `config.js`:

 - set `ipModule.url` to your ip150 url.
 - fill `ipModule.url.login` and `ipModule.url.password` to match your ip150 user/password
 - set `api.users` with a list or `{"login": "password"}` pair of autorized api users.


**By default, credentials used to login to the api are different from the ip150 module.**

If you want to forward api credentials to ip150 module :

 - set `config.api.forwardCredentials` to `true`

Note: `ipModule.url.login`, `ipModule.url.password` and `api.users` are no longer used.

## Running

## With Docker (the recommended way)

### Command line

    sudo docker run -d \
    -v /local/data:/data \
    -p 3000:3000 \
    -e UID=1001 \
    -e GID=1002 \
    --name paradox-api \
    calfater/paradox-api

### With crane (the royal recommended way)

```crane
  paradox-api:  
    image: calfater/paradox-api:latest  
    detach: true  
    env:
      - UID=1000
      - GID=1000
    ports:  
      - "3000:3000"
    volumes:
      - paradox-api/data:/data
```

## Without Docker 

Install node and npm.

Run : `npm install && npm start`

## Usage

Go to _http://paradox-api:3000/area_ to get state of all your areas.


## Testing  / debugging

### View logs

`sudo docker logs -f paradox-api`

### Connects on container

`sudo docker exec paradox-api bash`


## Building

### Docker
    docker build --build-arg U=paradoxapi -t calfater/paradox-api:latest .