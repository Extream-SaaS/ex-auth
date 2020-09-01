const authController = require('./authController');
const userController = require('./userController');

const userRepository = require('../repositories/user');
const tokenRepository = require('../repositories/token');
const authClientRepository = require('../repositories/authClient');

module.exports = {
    userController: new userController(userRepository, authClientRepository),
    authController: new authController(userRepository, tokenRepository),
};
