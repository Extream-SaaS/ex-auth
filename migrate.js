require('dotenv').config();
require('@google-cloud/debug-agent').start({serviceContext: {enableCanary: false}});
const {database} = require('./db/config/database');
database.migrate().then(() => {
    console.log(`database migrated`);
    process.exit();
}).catch((err) => {
    console.log('failed to configure database', err);
    process.exit(1);
});
