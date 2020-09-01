const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const sendResponse = require('../utility/response');
const emailService = require('../services/email');
const UserMapper = require('../mappers/user');

class UserController {
    constructor(userRepository, authClientRepository) {
        this.userRespository = userRepository;
        this.authClientRepository = authClientRepository;

        this.registerUser = this.registerUser.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.getInvitee = this.getInvitee.bind(this);
        this.completeInviteeRegistration = this.completeInviteeRegistration.bind(this);
        this.passwordLessLink = this.passwordLessLink.bind(this);
    }

    async registerUser(req, res) {
        try {
            const existingUser = await this.userRespository.getByUsername(req.body.username, req.authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists'}, 409);
            }

            const hashed = await bcrypt.hash(req.body.password, 10);
            const newUser = await this.userRespository.create(req.body.username, req.body.email, hashed, null, req.body.user_type, req.body.user, req.authClient.clientId, 'active');
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            return sendResponse(res, UserMapper.toResponse(newUser));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async inviteUser(req, res) {
        try {
            const existingUser = await this.userRespository.getByUsername(req.body.username, req.authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists'}, 409);
            }

            const newUser = await this.userRespository.create(req.body.username, req.body.email, undefined, null, req.body.user_type, req.body.user, req.authClient.clientId, 'invited');
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            await emailService.sendInviteeSignUp(newUser.email, newUser.public_id, 'some name');
            return sendResponse(res);
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async getInvitee(req, res) {
        try {
            const user = await this.userRespository.getByPublicId(req.params.public_id, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'invitee not found'}, 404);
            }
            return sendResponse(res, UserMapper.toResponse(user));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async completeInviteeRegistration(req, res) {
        try {
            const user = await this.userRespository.getByPublicId(req.params.public_id, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'invitee not found'}, 404);
            }
            if (user.status !== 'invited') {
                return sendResponse(res, {message: 'user is not invitee'}, 400);
            }

            user.password = await bcrypt.hash(req.body.password, 10);
            user.passwordExpiry = null;
            user.username = req.body.username;
            user.email = req.body.email;
            user.user_type = req.body.user_type;
            user.fields = JSON.parse(req.body.user);
            user.status = 'active';
            const updated = await this.userRespository.updateByInstance(user);
            return sendResponse(res, UserMapper.toResponse(updated));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async passwordLessLink(req, res) {
        try {
            const user = await this.userRespository.getByUsername(req.body.username, req.authClient.clientId);
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
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }
}

module.exports = UserController;
