const {Sequelize} = require('sequelize');



const User = require('../models/user');
const Token = require('../models/token');
const Client = require('../models/client');
const AuthClient = require('../models/authClient');
// import {User} from "../models/user";
// import {Token} from "../models/token";

const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const name = process.env.DB_NAME;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const environment = process.env.ENVIRONMENT;

// export const database = new Sequelize(name, username, password, {
//     host: host,
//     dialect: 'postgres',
//     port: Number(port),
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000,
//     },
// });

class Database {
    constructor() {
        this.connection = new Sequelize(name, username, password, {
            host: host,
            dialect: 'postgres',
            port: Number(port),
            pool: {
                max: 5,
                min: 0,
                idle: 10000,
            },
        });
    }

    async configure() {
        const models = this.initialiseModels();
        this.associateModels(models);
        await this.syncDatabases();
    }

    initialiseModels() {
        return  {
            user: User.init(...User.definition(this.connection)),
            token: Token.init(...Token.definition(this.connection)),
            client: Client.init(...Client.definition(this.connection)),
            authClient: AuthClient.init(...AuthClient.definition(this.connection)),
        };
    }

    associateModels(models) {
        for (const model in models) {
            if (Object.prototype.hasOwnProperty.call(models, model)) {
                if (typeof models[model].associate === 'function') {
                    models[model].associate(models);
                }
            }
        }
    }

    async syncDatabases() {
        if (environment === 'local') {
            await this.connection.sync({alter: true}).then(() => console.log('finished Syncing Tables'));
        } else {
            console.log(`no sync required - ${environment} environment`);
        }
    }

}

module.exports.database = new Database();
module.exports.connection = exports.database.connection;
