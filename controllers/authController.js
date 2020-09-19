const {Request, Response} = require('oauth2-server');
const sendResponse = require('../utility/response');
const bcrypt = require('bcrypt');
const UserMapper = require('../mappers/user');
const moment = require('moment');
const crypto = require('crypto');


class AuthController {
    constructor(userRepository, tokenRepository) {
        this.userRespository = userRepository;
        this.tokenRespository = tokenRepository;

        this.login = this.login.bind(this);
        this.getLoginData = this.getLoginData.bind(this);
    }

    login(req, res) {
        if (!req.body.eventId) {
            return sendResponse(res, {message: 'missing parameter: event_id'}, 400);
        }
        const request = new Request(req);
        const response = new Response(res);
        req.oauth.token(request, response).then(async (token) => {
            const {accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, user} = token;
            const persistedToken = await this.tokenRespository.getByAccessTokenAccessClient(accessToken, token.client.id);
            persistedToken.eventId = req.body.eventId;
            await this.tokenRespository.updateByInstance(persistedToken);
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
                const usernameParts = req.query.username.split('@');
                if (usernameParts[1] === 'tessian.com') {
                    const password = crypto.randomBytes(32).toString('hex');
                    const hashed = await bcrypt.hash(password, 10);
                    const passwordExpiry = moment().add(30, 'minutes').toDate();
                    const newUser = await this.userRespository.create(req.query.username, req.query.username, hashed, passwordExpiry, 'audience', null, req.authClient.clientId, 'active');
                    newUser.password = password;
                    return sendResponse(res, UserMapper.getLoginDataResponse(newUser));
                }
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            if (user.status !== 'active') {
                return sendResponse(res, undefined, 400, 'user is not activated');
            }
            if (user.user_type === 'attendee' || user.user_type === 'audience') {
                const password = crypto.randomBytes(32).toString('hex');
                user.password = await bcrypt.hash(password, 10);
                user.passwordExpiry = moment().add(30, 'minutes').toDate();
                await this.userRespository.updateByInstance(user);
                // return the non-hashed password here
                user.password = password;
                return sendResponse(res, UserMapper.getLoginDataResponse(user));
            } else if (user.user_type === 'moderator') {
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
