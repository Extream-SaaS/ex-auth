const User = require('../db/models/user');

class UserRepository {
    static create(username, user_password, user_type, fields, clientId) {
        const properties = {
            username,
            user_password,
            user_type,
            fields: JSON.parse(fields),
            clientId,
        };
        return User.create(properties);
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
}

module.exports = UserRepository;
