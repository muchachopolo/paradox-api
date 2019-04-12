module.exports = {
    ipModule: {
        url: "https://ip150:443", // The url of the ip150 module AND THE PORT (like in your browser)
        login: "1234", // user id
        password: "secret" // ip150 module password
    },
    api: {
        attempt: {
            read: 2,
            write: 3,
            check: 1
        },
        forwardCredentials: false,
        //forwardCredentials: true,
        users: {
            "paradox": "api", // login: password pair for using the API
        }
    }
};
