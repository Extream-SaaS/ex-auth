const bcrypt = require('bcrypt');
const sendResponse = require('../utility/response');

class UserController {
    constructor(userRepository, authClientRepository) {
        this.userRespository = userRepository;
        this.authClientRepository = authClientRepository;

        this.registerUser = this.registerUser.bind(this);
    }

    async registerUser(req, res) {
        try {
            const authClient = await this.authClientRepository.getByBasicAuthHeader(req.headers.authorization);
            const existingUser = await this.userRespository.getByUsername(req.body.username, authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists'}, 409);
            }

            const hashed = await bcrypt.hash(req.body.password, 10);
            const newUser = await this.userRespository.create(req.body.username, hashed, req.body.user_type, req.body.user, authClient.clientId);
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 409);
            }
            return sendResponse(res);
        } catch (e) {
            return sendResponse(res, undefined, 500, e);
        }
    }
}

module.exports = UserController;
