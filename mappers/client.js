class ClientMapper {
    static clientResponse(client) {
        return {
            id: client.id,
            name: client.name,
            createdAt: client.createdAt,
        };
    }

    static getPrivateResponse(auth) {
        return {
            id: auth.id,
            secret: auth.secret,
            authorization: Buffer.from(`${auth.id}:${auth.secret}`).toString('base64'),
            name: auth.name,
            createdAt: auth.createdAt,
            clientId: auth.clientId,
            loginLink: auth.loginLink,
            regLink: auth.regLink,
        };
    }

    static getPublicResponse(auth) {
        return {
            name: auth.name,
            clientId: auth.clientId,
            createdAt: auth.clientId,
            updatedAt: auth.updatedAt,
            loginLink: auth.loginLink,
            regLink: auth.regLink,
        };
    }
}

module.exports = ClientMapper;
