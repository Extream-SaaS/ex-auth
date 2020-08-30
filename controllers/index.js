const authController = require('./authController');
const userController = require('./userController');
const clientController = require('./clientController');

const userRepository = require('../repositories/user');
const tokenRepository = require('../repositories/token');
const authClientRepository = require('../repositories/authClient');
const clientRepository = require('../repositories/client');

module.exports = {
    userController: new userController(userRepository, authClientRepository),
    authController: new authController(userRepository, tokenRepository),
    clientController: new clientController(clientRepository, authClientRepository),
};
