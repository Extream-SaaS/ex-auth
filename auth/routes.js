const express = require("express");
const cors = require("cors");
const OAuth2Server = require('oauth2-server');

const {userController, authController} = require('../controllers');
const authClientRepository = require('../repositories/authClient');
const userRepository = require('../repositories/user');
const tokenRepository = require('../repositories/token');
const BaseModel = require('../auth/models/baseModel');

class Routes {
  constructor() {
    this.router = express.Router();
    this.router.use(cors({origin: '*'}));
    this.router.use(this.setOauth);
    this.assignRoutes();
  }

  async setOauth(req, res, next) {
    const authClient = await authClientRepository.getByBasicAuthHeader(req.headers.authorization);
    if (!authClient) {
      res.sendStatus(401);
    }
    // can add a call to a factory class/function here if using separate auth models for separate clients
    const model = new BaseModel(authClient.clientId, userRepository, tokenRepository, authClientRepository);
    req.oauth = new OAuth2Server({
      model: model,
      accessTokenLifetime: 86400,
      refreshTokenLifetime: 172800,
    });
    next();
  }

  assignRoutes() {
    this.router.post('/register', userController.registerUser);
    this.router.post('/login', authController.login);
  }
}

module.exports = new Routes();
