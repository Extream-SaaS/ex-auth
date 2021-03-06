const {Model, DataTypes} = require('sequelize');

class User extends Model {
    static definition(sequelize) {
        return [
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                },
                public_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    defaultValue: DataTypes.UUIDV4,
                },
                username: {
                    type: DataTypes.STRING,
                },
                email: {
                    type: DataTypes.STRING,
                },
                firstName: {
                    type: DataTypes.STRING,
                },
                lastName: {
                    type: DataTypes.STRING,
                },
                password: {
                    type: DataTypes.STRING,
                },
                passwordExpiry: {
                    type: DataTypes.DATE,
                },
                fields: {
                    type: DataTypes.JSON,
                },
                user_type: {
                    type: DataTypes.STRING,
                },
                status: {
                    type: DataTypes.STRING,
                }
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['username', 'clientId'],
                    },
                    {
                        unique: true,
                        fields: ['email', 'clientId'],
                    }
                ],
                sequelize: sequelize,
                modelName: 'user',
                charset: 'utf8',
                collate: 'utf8_general_ci',
                freezeTableName: true,
            },
        ];
    }
    static associate(models) {
        User.hasMany(models.token);
    }
}

module.exports = User;
