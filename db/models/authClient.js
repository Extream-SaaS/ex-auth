const {Model, DataTypes} = require('sequelize');

class AuthClient extends Model {
    static definition(sequelize) {
        return [
            {
                id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    primaryKey: true,
                    defaultValue: DataTypes.UUIDV4,
                },
                secret: {
                    type: DataTypes.STRING,
                },
                grants: {
                    type: DataTypes.JSON,
                },
                name: {
                    type: DataTypes.STRING,
                },
            },
            {
                modelName: 'authClient',
                sequelize: sequelize,
                charset: 'utf8',
                collate: 'utf8_general_ci',
                freezeTableName: true,
            },
        ];
    }
    static associate(models) {
        AuthClient.hasMany(models.token, { foreignKey: 'accessClientId'});
        AuthClient.hasMany(models.token, { foreignKey: 'refreshClientId'});
        AuthClient.belongsTo(models.client);
    }
    // public id: string;
    // public secret: string;
    // public grants: string;
    // public name: string;
}

module.exports = AuthClient;
