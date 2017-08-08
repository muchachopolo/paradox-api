# Paradox API for IP150

The Paradox API allow you to read/write areas state of you Paradox system.

A web server is exposed an you can use REST operation to manage our Alarm.

**The Paradox API needs the IP150 module to connect to your Paradox system.**

## Configuration

Edit (or create) the file `config.js`:

```javascript
module.exports = {
  url: "https://ip150:443",
  login: "code",
  password: "ip150-password"
};
```

## Running

## With Docker (the recommended way)

### Command line

`sudo docker run -v /path/to/paradox-api/config.js:/home/paradox-api/config.js:ro -p 3000:3000 --name paradox-api -d calfater/paradox-api`

### With crane (the royal recommended way)


```crane
  paradox-api:  
    image: calfater/paradox-api:latest  
    detach: true  
    ports:  
      - "3000:3000"
    volumes:
      - paradox-api/config.js:/home/paradox-api/config.js:ro
    depends_on: 
      - proxy-nginx
```

## Withour Docker 

Install node and npm.

Run : `npm install && npm start`

## Usage

Go to _http://paradox-api:3000/area_ to get state of all your areas.


## Testing  / debugging

`sudo docker exec paradox-api bash`

