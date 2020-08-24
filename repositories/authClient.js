const AuthClient = require('../db/models/authClient');

class AuthClientRepository {
    // static create(accessToken, userId) {
    //     const properties = {
    //         accessToken,
    //         userId,
    //     };
    //     return Token.create(properties);
    // }

    static getByIdSecret(id, secret) {
        return AuthClient.findOne(
            {
                where: {
                    id: id,
                    secret: secret,
                }
            }
        );
    }

    static getByBasicAuthHeader(basicAuthHeader) {
        const basicAuthToken = basicAuthHeader.slice(6);
        const buff = Buffer.from(basicAuthToken, 'base64');
        const decoded = buff.toString('ascii');
        const split = decoded.split(':');
        return AuthClient.findOne(
            {
                where: {
                    id: split[0],
                    secret: split[1],
                },
            }
        );
    }
}

module.exports = AuthClientRepository;
