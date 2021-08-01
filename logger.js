function log(req, res, next) {
    console.log('logging...');
    next();
}

function auth(req, res, next) {
    console.log('Autenticando...');
    next();
}
module.exports = {
    log,
    auth
};