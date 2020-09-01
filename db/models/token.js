const {Model, DataTypes} = require('sequelize');
// import AuthClient from './AuthClient';
// import User from './User';
// import Login from './Login';
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
        // Token.belongsTo(models.User);
        Token.belongsTo(models.authClient, { as: 'accessClient' });
        Token.belongsTo(models.authClient, { as: 'refreshClient' });
        // Token.belongsTo(models.Login);
    }
}

module.exports = Token;
