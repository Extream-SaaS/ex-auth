const {Request, Response} = require('oauth2-server');
const sendResponse = require('../utility/response');

class AuthController {
    constructor(userRepository, tokenRepository) {
        this.userRespository = userRepository;
        this.tokenRespository = tokenRepository;

        this.login = this.login.bind(this);
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

}

module.exports = AuthController;
