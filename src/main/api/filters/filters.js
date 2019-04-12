module.exports = (app) => {
    require('./authentication-filter')(app);
    require('./static-content-filter')(app);
}