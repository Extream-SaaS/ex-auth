const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const sendResponse = require('../utility/response');
const emailService = require('../services/email');

class UserController {
    constructor(userRepository, authClientRepository) {
        this.userRespository = userRepository;
        this.authClientRepository = authClientRepository;

        this.registerUser = this.registerUser.bind(this);
        this.passwordLessLink = this.passwordLessLink.bind(this);
    }

    async registerUser(req, res) {
        // await emailService.sendTest();
        // return sendResponse(res, undefined, 200);
        try {
            const authClient = await this.authClientRepository.getByBasicAuthHeader(req.headers.authorization);
            if (!authClient) {
                return sendResponse(res, {message: 'unauthorized'}, 401);
            }
            const existingUser = await this.userRespository.getByUsername(req.body.username, authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists'}, 409);
            }

            const hashed = await bcrypt.hash(req.body.password, 10);
            const newUser = await this.userRespository.create(req.body.username, req.body.email, hashed, req.body.user_type, req.body.user, authClient.clientId);
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 409);
            }
            return sendResponse(res);
        } catch (e) {
            return sendResponse(res, undefined, 500, e);
        }
    }

    async passwordLessLink(req, res) {
        try {
            const authClient = await this.authClientRepository.getByBasicAuthHeader(req.headers.authorization);
            if (!authClient) {
                return sendResponse(res, {message: 'unauthorized'}, 401);
            }
            const user = await this.userRespository.getByUsername(req.body.username, authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            const password = await crypto.randomBytes(32).toString('hex');
            user.password = await bcrypt.hash(password, 10);
            user.passwordExpiry = moment().add(30, 'minutes').toDate();
            let firstName = undefined;
            let lastName = undefined;
            if (user.fields.firstName) {
                firstName = user.fields.firstName;
            }
            if (user.fields.lastName) {
                lastName = user.fields.lastName;
            }
            await this.userRespository.updateByInstance(user);
            await emailService.sendPasswordlessLoginLink(user.email, user.username, firstName, lastName, password);
            return sendResponse(res);
        } catch (e) {
            return sendResponse(res, undefined, 500, e);
        }
    }
}

module.exports = UserController;
