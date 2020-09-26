const {Model, DataTypes} = require('sequelize');

class Client extends Model {
    static definition(sequelize) {
        return [
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                grants: {
                    type: DataTypes.JSON,
                },
                accessTokenLifetime: {
                    type: DataTypes.INTEGER,
                },
                refreshTokenLifetime: {
                    type: DataTypes.INTEGER,
                },
                authModel: {
                    type: DataTypes.STRING,
                },
                name: {
                    type: DataTypes.STRING,
                },
            },
            {
                modelName: 'client',
                sequelize: sequelize,
                charset: 'utf8',
                collate: 'utf8_general_ci',
                freezeTableName: true,
            }
        ];
    }

    static associate(models) {
        Client.hasMany(models.user);
        Client.hasMany(models.authClient);
    }
}

module.exports = Client;
