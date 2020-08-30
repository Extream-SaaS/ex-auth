const {Sequelize} = require('sequelize');



const User = require('../models/user');
const Token = require('../models/token');
const Client = require('../models/client');
const AuthClient = require('../models/authClient');
// import {User} from "../models/user";
// import {Token} from "../models/token";

const username = process.env.DB_USERNAME || process.env.CLOUD_SQL_USERNAME;
const password = process.env.DB_PASSWORD || process.env.CLOUD_SQL_PASSWORD;
const name = process.env.DB_NAME || process.env.CLOUD_SQL_DATABASE;
const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql";
const host = process.env.DB_HOST || `${dbSocketPath}/${process.env.CLOUD_SQL_INSTANCE}`;
const port = process.env.DB_PORT;
const environment = process.env.ENVIRONMENT;

let config = {
    host: host,
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
}
if (port) {
    config.port = Number(port);
}

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
        this.connection = new Sequelize(name, username, password, config);
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

    async migrate() {
        // proper migration required but this for now
        try {
            const models = this.initialiseModels();
            this.associateModels(models);
            await this.connection.sync().then(() => console.log('finished Syncing Tables'));
        } catch (error) {
            console.error('unable to sync', error);
        }
    }

}

module.exports.database = new Database();
module.exports.connection = exports.database.connection;
