const User = require('../db/models/user');
const Token = require('../db/models/token');

class UserRepository {
      static create(username, email, firstName, lastName, password, passwordExpiry, user_type, user_fields, clientId, status, transaction) {
        let fields = {};
        console.log(user_fields);
        try {
            fields = JSON.parse(user_fields);
        } catch (error) {
            fields = JSON.parse(user_fields.substring(1).slice(0, -1));
        }
        const properties = {
            username,
            email,
            firstName,
            lastName,
            password,
            passwordExpiry,
            user_type,
            fields,
            clientId,
            status,
        };
        const options = {};
        if (transaction) {
            options.transaction = transaction;
        }
        return User.create(properties, {});
    }

    static count() {
        return User.count();
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

    static getByToken(authorization) {
        const token = authorization.slice(7);
        return User.findOne(
            {
                include: [
                    {
                        model: Token,
                        where: {
                            accessToken: token,
                        }
                    }
                ]
            }
        );
    }

    static getByClientId(clientId, user_type=null) {
        const where = {
            clientId,
        };
        if (user_type) {
            where.user_type = user_type;
        }
        return User.findAll({
            where,
        });
    }

    static updateByInstance(user) {
        return user.save();
    }

    static updateByInstanceWithProperties(user, properties) {
        return user.update(properties);
    }
}

module.exports = UserRepository;
