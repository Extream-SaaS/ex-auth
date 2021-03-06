const AuthClient = require('../db/models/authClient');
const Token = require('../db/models/token');

class AuthClientRepository {
    static create(secret, name, clientId, loginLink, regLink, senderEmail) {
        const properties = {
            secret,
            name,
            clientId,
            grants: [
                'password',
                'refresh_token'
            ],
            loginLink,
            regLink,
            senderEmail,
        };
        return AuthClient.create(properties);
    }

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

    static getByBearerAuthHeader(bearerAuthHeader) {
        const bearerAuthToken = bearerAuthHeader.slice(7);
        return AuthClient.findOne(
            {
                include: [
                    {
                        model: Token,
                        where: {
                            accessToken: bearerAuthToken,
                        }
                    }
                ]
            }
        );
    }
}

module.exports = AuthClientRepository;
