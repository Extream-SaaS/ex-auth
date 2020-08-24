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
                user_password: {
                    type: DataTypes.STRING,
                },
                fields: {
                    type: DataTypes.JSON,
                },
                user_type: {
                    type: DataTypes.STRING,
                },
            },
            {
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

    // public id: string;
    // public username: string;
    // public password: string;
    // public pin: string;
    // public email: string;
    // public state: string;
    // public readonly userAccountScopes ?: UserAccountScopes[];
    // public scopes: string[];
    // public resetToken: string;
    // public phone: string;
    // public passwordShares: {key: string, value: string}[];
    // public pinShares: {key: string, value: string}[];
    // public admin: number;
}

module.exports = User;
