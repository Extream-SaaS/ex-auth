const {Model, DataTypes} = require('sequelize');
class Token extends Model {
    static definition(sequelize) {
        return [
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                accessToken: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                accessTokenExpiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                refreshToken: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                refreshTokenExpiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
                scopes: {
                    type: DataTypes.JSON,
                },
                eventId: {
                    type: DataTypes.UUID,
                },
                enabled: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                }
            },
            {
                modelName: 'token',
                sequelize: sequelize,
                charset: 'utf8',
                collate: 'utf8_general_ci',
                freezeTableName: true,
            },
        ];
    }

    static associate(models) {
        Token.belongsTo(models.user);
        Token.belongsTo(models.authClient, { as: 'accessClient' });
        Token.belongsTo(models.authClient, { as: 'refreshClient' });
    }
}

module.exports = Token;
