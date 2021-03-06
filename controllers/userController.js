const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const sendResponse = require('../utility/response');
const emailService = require('../services/email');
const UserMapper = require('../mappers/user');
const eventLogger = require('../utility/monitoring');

class UserController {
    constructor(userRepository, authClientRepository) {
        this.userRepository = userRepository;
        this.authClientRepository = authClientRepository;

        this.registerUser = this.registerUser.bind(this);
        this.inviteUser = this.inviteUser.bind(this);
        this.getInvitee = this.getInvitee.bind(this);
        this.completeInviteeRegistration = this.completeInviteeRegistration.bind(this);
        this.passwordLessLink = this.passwordLessLink.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getUserByToken = this.getUserByToken.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }

    async registerUser(req, res) {
        try {
            const existingUser = await this.userRepository.getByUsername(req.body.username, req.authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists'}, 409);
            }

            const hashed = await bcrypt.hash(req.body.password, 10);
            const newUser = await this.userRepository.create(req.body.username, req.body.email, req.body.firstName, req.body.lastName, hashed, null, req.body.user_type, req.body.user, req.authClient.clientId, 'active');
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            const userLogData = {id: newUser.public_id, email: newUser.email, username: newUser.username, fields: newUser.fields, user_type: newUser.user_type};
            await eventLogger.logEvent({event: {command: 'register', success: true}, auth: {user: userLogData}}, req.authClient.clientId, req.body.eventId || null);
            return sendResponse(res, UserMapper.toResponse(newUser));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async inviteUser(req, res) {
        try {
            const existingUser = await this.userRepository.getByUsername(req.body.username, req.authClient.clientId);
            if (existingUser) {
                return sendResponse(res, {message: 'user exists', id: existingUser.public_id}, 409);
            }

            const newUser = await this.userRepository.create(req.body.username, req.body.email, null, null, undefined, null, req.body.user_type, req.body.user, req.authClient.clientId, 'invited');
            if (!newUser) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            if (typeof req.body.notify === 'undefined' || req.body.notify !== 'false') {
                await emailService.sendInviteeSignUp(newUser.email, newUser.public_id, req.authClient.name, req.authClient.regLink, req.authClient.senderEmail);
            }
            return sendResponse(res, UserMapper.toResponse(newUser));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async updateUser(req, res) {
        try {
            if (req.params.public_id !== req.token.user.public_id) {
                return sendResponse(res, {message: 'unauthorized'}, 401);
            }
            let user = await this.userRepository.getByPublicId(req.params.public_id, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            const allowedProperties = {
                username: req.body.username,
                email: req.body.email,
                user_type: req.body.user_type,
                fields: JSON.parse(req.body.fields || null) || undefined,
                firstNam: req.body.firstName,
                lastName: req.body.lastName,
            };
            if (req.body.password) {
                allowedProperties.password = await bcrypt.hash(req.body.password, 10);
                allowedProperties.passwordExpiry = null;
            }
            Object.keys(allowedProperties).forEach(key => allowedProperties[key] === undefined && delete allowedProperties[key]);
            await this.userRepository.updateByInstanceWithProperties(user, allowedProperties);
            return sendResponse(res, UserMapper.toResponse(user));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async getInvitee(req, res) {
        try {
            const user = await this.userRepository.getByPublicId(req.params.public_id, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'invitee not found'}, 404);
            }
            return sendResponse(res, UserMapper.toResponse(user));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async getUser(req, res) {
        try {
            const user = await this.userRepository.getByPublicId(req.params.public_id, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            return sendResponse(res, UserMapper.toResponse(user));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async getUsers(req, res) {
        try {
            if (req.token.user.user_type !== 'crew' && req.token.user.user_type !== 'chief') {
                return sendResponse(res, { message: 'Unauthorized' }, 401)
            }
            const users = await this.userRepository.getByClientId(req.authClient.clientId, req.params.user_type);
            if (users) {
                const allowedProperties = ['username', 'email', 'user_type', 'firstName', 'lastName'];
                const prepped = users.reduce((userList, user) => {
                    return {
                        ...userList,
                        [user.public_id]: allowedProperties.reduce((acc, prop) => {
                            return {...acc, [prop]: user[prop]};
                        }, {})
                    };
                }, {});
                return sendResponse(res, prepped);
            }
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async getUsersByOrg(req, res) {
        try {
            if (req.token.user.user_type !== 'chief') {
                return sendResponse(res, { message: 'Unauthorized' }, 401)
            }
            const users = await this.userRepository.getByOrganisation(req.params.organisation, req.params.user_type);
            if (users) {
                const allowedProperties = ['username', 'email', 'user_type', 'firstName', 'lastName'];
                const prepped = users.reduce((userList, user) => {
                    return {
                        ...userList,
                        [user.public_id]: allowedProperties.reduce((acc, prop) => {
                            return {...acc, [prop]: user[prop]};
                        }, {})
                    };
                }, {});
                return sendResponse(res, prepped);
            }
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async completeInviteeRegistration(req, res) {
        try {
            const user = await this.userRepository.getByPublicId(req.params.public_id, req.authClient.clientId);
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
            user.firstName = req.body.firstNam;
            user.lastName = req.body.lastName;
            user.fields = JSON.parse(req.body.user);
            user.status = 'active';
            const updated = await this.userRepository.updateByInstance(user);
            return sendResponse(res, UserMapper.toResponse(updated));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async passwordLessLink(req, res) {
        try {
            const user = await this.userRepository.getByUsername(req.body.username, req.authClient.clientId);
            if (!user) {
                return sendResponse(res, {message: 'user not found'}, 404);
            }
            const password = await crypto.randomBytes(32).toString('hex');
            user.password = await bcrypt.hash(password, 10);
            user.passwordExpiry = moment().add(30, 'minutes').toDate();
            let firstName;
            let lastName;
            if (user.fields.firstName) {
                firstName = user.fields.firstName;
            }
            if (user.fields.lastName) {
                lastName = user.fields.lastName;
            }
            await this.userRepository.updateByInstance(user);
            await emailService.sendPasswordlessLoginLink(user.email, user.username, firstName, lastName, password, req.authClient.name, req.authClient.loginUrl);
            return sendResponse(res);
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    getUserByToken(req, res) {
        return sendResponse(res, UserMapper.toResponseWithEventId(req.token));
    }
}

module.exports = UserController;
