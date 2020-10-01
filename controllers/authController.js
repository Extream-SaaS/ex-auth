const {Request, Response} = require('oauth2-server');
const sendResponse = require('../utility/response');
const bcrypt = require('bcrypt');
const UserMapper = require('../mappers/user');
const moment = require('moment');
const crypto = require('crypto');
const eventLogger = require('../utility/monitoring');


class AuthController {
    constructor(userRepository, tokenRepository) {
        this.userRespository = userRepository;
        this.tokenRespository = tokenRepository;

        this.login = this.login.bind(this);
        this.getLoginData = this.getLoginData.bind(this);
    }

    login(req, res) {
        if (!req.body.eventId) {
            return sendResponse(res, {message: 'missing parameter: eventId'}, 400);
        }
        const request = new Request(req);
        const response = new Response(res);
        req.oauth.token(request, response).then(async (token) => {
            const {accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, user} = token;
            const persistedToken = await this.tokenRespository.getByAccessTokenAccessClient(accessToken, token.client.id);
            persistedToken.eventId = req.body.eventId;
            await this.tokenRespository.updateByInstance(persistedToken);
            await eventLogger.logEvent({event: {command: 'login', success: true}, auth: {token: accessToken, user: {id: user.public_id}}}, req.authClient.clientId, req.body.eventId);
            return sendResponse(res, {accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, id: user.public_id});
        }).catch((err) => {
            console.log('err', err);
            return sendResponse(res, {message: 'unauthorized'}, 401);
        });
    }

    async getLoginData(req, res) {
        try {
            if (!req.query.username) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            const user = await this.userRespository.getByUsername(req.query.username, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            if (user.status !== 'active') {
                return sendResponse(res, undefined, 400, 'user is not activated');
            }
            // this is bad news, but we cannot get actors to create passwords when coming from an external source
            if (user.user_type === 'attendee' ||
                user.user_type === 'audience' ||
                user.user_type === 'actor'
            ) {
                const password = crypto.randomBytes(32).toString('hex');
                user.password = await bcrypt.hash(password, 10);
                user.passwordExpiry = moment().add(30, 'minutes').toDate();
                await this.userRespository.updateByInstance(user);
                // return the non-hashed password here
                user.password = password;
                return sendResponse(res, UserMapper.getLoginDataResponse(user));
            } else if (user.user_type === 'moderator' || user.user_type === 'crew' || user.user_type === 'chief') {
                return sendResponse(res, UserMapper.getLoginDataResponse({username: user.username, user_type: user.user_type}));
            } else {
                return sendResponse(res, undefined, 400, 'unknown user type');
            }
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

}

module.exports = AuthController;
