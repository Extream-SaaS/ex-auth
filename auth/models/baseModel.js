const bcrypt = require('bcrypt');

class BaseModel {
    constructor(clientId, userRepository, tokenRepository, authClientRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.authClientRepository = authClientRepository;
        this.clientId = clientId;
    }

    async getUser(username, password) {
        console.log('CALLING GET USER', username, this.clientId);
        const user = await this.userRepository.getByUsername(username, this.clientId);
        if (!user) {
            return Promise.resolve(null);
        }
        if (!await bcrypt.compare(password, user.password)) {
            return Promise.resolve(null);
        }
        return Promise.resolve(user);
    }

    async getClient(clientId, clientSecret) {
        console.log('CALLING GET CLIENT');
        const authClient = this.authClientRepository.getByIdSecret(clientId, clientSecret);
        if (!authClient) {
            return Promise.resolve(null);
        }
        return Promise.resolve(authClient);
    }

    async getRefreshToken(refreshToken) {
        console.log('CALLING GET REFRESH TOKEN');
        let token = await this.tokenRepository.getByRefreshToken(refreshToken);
        if (!token) {
            return Promise.resolve(null);
        }
        token = {...token.get({plain: true}), ...{client: token.refreshClient}};
        return Promise.resolve(token);
    }

    async getAccessToken(accessToken) {
        console.log('CALLING GET ACCESS TOKEN');
        const token = await this.tokenRepository.getUserByAccessToken(accessToken);
        return {
            accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            client: {
                id: token.user.clientId
            },
            user: token.user,
            eventId: token.eventId,
        };
    }

    async saveToken(token, client, user) {
        console.log('CALLING SAVE TOKEN');
        const newToken = await this.tokenRepository.create(token.accessToken, token.accessTokenExpiresAt, token.refreshToken, token.refreshTokenExpiresAt, true, client.id, client.id, user.id);
        if (!newToken) {
            return Promise.resolve(null);
        }
        token.client = client;
        token.user = user;
        token.id = newToken.id;
        return Promise.resolve(token);
    }

    async revokeToken(accessToken) {
        console.log('CALLING REVOKE TOKEN');
        const deleted = await this.tokenRepository.deleteById(accessToken.id);
        if (deleted === 1) {
            return Promise.resolve(true);
        }
        return Promise.resolve(null);
    }
}

module.exports = BaseModel;
