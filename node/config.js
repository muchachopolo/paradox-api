module.exports = {
  ipModule: {
    url: "https://ip150:443", // The url of the ip150 module (like in your browser)
    login: "1234", 
    password: "secret"
  },
  api: {
    forwardCredentials: false,
    users: {
      "paradox": "api" // login: password pair for using the API
    }
  }
};
