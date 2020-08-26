const express = require("express");
const cors = require("cors");
const OAuth2Server = require('oauth2-server');
const sendResponse = require('../utility/response');

const {userController, authController} = require('../controllers');
const authClientRepository = require('../repositories/authClient');
const userRepository = require('../repositories/user');
const tokenRepository = require('../repositories/token');
const BaseModel = require('../auth/models/baseModel');

class Routes {
    constructor() {
        this.router = express.Router();
        this.router.use(cors({origin: '*'}));
        this.router.use(this.identifyAuthClient);
        this.assignRoutes();
    }

    async identifyAuthClient(req, res, next) {
        if (!req.headers.authorization) {
            return sendResponse(res, undefined, 401);
        }
        let authClient;
        if (req.headers.authorization.slice(0, 5) === 'Basic') {
            authClient = await authClientRepository.getByBasicAuthHeader(req.headers.authorization);
        } else if (req.headers.authorization.slice(0, 6) === 'Bearer') {
            authClient = await authClientRepository.getByBearerAuthHeader(req.headers.authorization);
        }
        if (!authClient) {
            return sendResponse(res, undefined, 401);
        }
        req.authClient = authClient;
        next();
    }

    async setOauth(req, res, next) {
        try {
            if (!req.headers.authorization) {
                return sendResponse(res, undefined, 401);
            }
            let authClient;
            if (req.headers.authorization.slice(0, 5) === 'Basic') {
                authClient = await authClientRepository.getByBasicAuthHeader(req.headers.authorization);
            } else if (req.headers.authorization.slice(0, 6) === 'Bearer') {
                authClient = await authClientRepository.getByBearerAuthHeader(req.headers.authorization);
            }
            if (!authClient) {
                return sendResponse(res, undefined, 401);
            }

            // can add a call to a factory class/function here if using separate auth models for separate clients
            const model = new BaseModel(authClient.clientId, userRepository, tokenRepository, authClientRepository);
            req.oauth = new OAuth2Server({
                model: model,
                accessTokenLifetime: 86400,
                refreshTokenLifetime: 172800,
            });
            next();
        } catch (err) {
            return sendResponse(res, undefined, 418, err);
        }
    }

    assignRoutes() {
        this.router.post('/register', userController.registerUser);
        this.router.post('/invite', userController.inviteUser);
        this.router.get('/invitee/:public_id', userController.getInvitee);
        this.router.post('/invitee/:public_id/register', userController.completeInviteeRegistration);
        this.router.post('/login', this.setOauth, authController.login);
        this.router.get('/login', authController.getLoginData);
        this.router.post('/login/passwordless', userController.passwordLessLink);
    }
}

module.exports = new Routes();
