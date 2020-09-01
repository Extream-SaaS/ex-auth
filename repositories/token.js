const Token = require('../db/models/token');
const User = require('../db/models/user');
const AuthClient = require('../db/models/authClient');

class TokenRepository {
    static create(accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt, enabled, accessClientId, refreshClientId, userId) {
        const properties = {
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            enabled,
            accessClientId,
            refreshClientId,
            userId,
        };
        return Token.create(properties);
    }

    static getUserIdByAccessToken(accessToken) {
        return Token.findOne(
            {
                where: {
                    accessToken: accessToken,
                },
                attributes: ['userId']
            }
        );
    }

    static getUserByAccessToken(accessToken) {
        return Token.findOne(
            {
                where: {
                    accessToken
                },
                include: [
                    {
                        model: User
                    }
                ]
            }
        );
    }

    static getByRefreshToken(refreshToken) {
        return Token.findOne(
            {
                where: {
                    refreshToken: refreshToken,
                },
                include: [
                    {
                        model: User,
                    },
                    {
                        model: AuthClient,
                        as: 'refreshClient',
                    }
                ]
            }
        );
    }

    static deleteById(tokenId) {
        return Token.destroy(
            {
                where: {
                    id: tokenId,
                }
            }
        );
    }
}

module.exports = TokenRepository;
