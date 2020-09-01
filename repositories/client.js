const Client = require('../db/models/client');

class ClientRepository {
    static create(name, clientId) {
        const properties = {
            name,
            clientId,
            grants: [
                'password',
                'refresh_token'
            ],
            accessTokenLifetime: 86400,
            refreshTokenLifetime: 172800,
            authModel: 'base',
        };
        return Client.create(properties);
    }

    static getByName(clientName) {
        return Client.findOne(
            {
                where: {
                    name: clientName,
                }
            }
        );
    }

    static getById(clientId) {
        return Client.findByPk(clientId);
    }

    static verifySecureHeader(authHeader) {
        const token = authHeader.slice(6);
        const buff = Buffer.from(token, 'base64');
        const decoded = buff.toString('ascii');
        return decoded === process.env.SECURE_KEY;
    }
}

module.exports = ClientRepository;
