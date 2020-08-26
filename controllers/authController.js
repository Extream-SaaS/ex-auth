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
        const request = new Request(req);
        const response = new Response(res);
        req.oauth.token(request, response).then((token) => {
            const {accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt} = token;
            return sendResponse(res, {accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt});
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
            if (user.user_type === 'attendee') {
                const password = await crypto.randomBytes(32).toString('hex');
                user.password = await bcrypt.hash(password, 10);
                user.passwordExpiry = moment().add(30, 'minutes').toDate();
                await this.userRespository.updateByInstance(user);
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
