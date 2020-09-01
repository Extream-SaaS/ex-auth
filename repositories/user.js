const User = require('../db/models/user');

class UserRepository {
    static create(username, email, password, passwordExpiry, user_type, fields, clientId, status) {
        const properties = {
            username,
            email,
            password,
            passwordExpiry,
            user_type,
            fields: JSON.parse(fields),
            clientId,
            status,
        };
        return User.create(properties);
    }

    static getByPublicId(publicId, clientId) {
        return User.findOne(
            {
                where: {
                    public_id: publicId,
                    clientId: clientId,
                }
            }
        );
    }

    static getByUsername(username, clientId) {
        return User.findOne(
            {
                where: {
                    username: username,
                    clientId: clientId,
                }
            }
        );
    }

    static updateByInstance(user) {
        return user.save();
    }
}

module.exports = UserRepository;
