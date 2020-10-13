if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
require('@google-cloud/debug-agent').start({serviceContext: {enableCanary: false}});
// eslint-disable-next-line no-unused-vars
const {database, connection} = require('./db/config/database');


// Express
const express = require("express");
const app = express();
// app.use(cors({
//     origin: '*'
// }));

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8881;

const routes = require('./auth/routes');
app.use('/auth', routes.router);


// eslint-disable-next-line no-unused-vars
/*async function importUsers(req, res) {
    const XLSX = require('xlsx');
    const userRepository = require('./repositories/user');
    const {UniqueConstraintError} = require('sequelize');
    const countBefore = await userRepository.count();
    const duplicates = [];
    console.log(`Users before import: ${countBefore}`);
    try {
        console.log('running import');

        const workbook = XLSX.readFile('dell-think-tank-2.xlsx');
        const sheet_name_list = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const usersToInsert = data.length;
        console.log(`Users to import: ${usersToInsert}`);
        for (const user of data) {
            const userType = user.user_type;
            const fields = {
                firstName: user['Firstname'],
                lastName: user['Lastname'],
                breakout1: user.breakout1,
                breakout2: user.breakout2,
                breakout3: user.breakout3,
                breakout4: user.breakout4,
                breakout5: user.breakout5,
                breakout6: user.breakout6,
                breakout7: user.breakout7,
                breakout8: user.breakout8,
                breakout9: user.breakout9,
                breakout10: user.breakout10,
            };
            try {
                await userRepository.create(user.Email, user.Email, null, null, userType, JSON.stringify(fields), 8, 'active');
            } catch (e) {
                console.log(`error on ${user.Email}`);
                if (e instanceof UniqueConstraintError) {
                    duplicates.push(user.Email);
                }

            }
        }
        // await transaction.commit();
        const countAfter = await userRepository.count();
        console.log(`Duplicate users:`, duplicates);
        console.log(`Before: ${countBefore}. To Import: ${usersToInsert}. Duplicates: ${duplicates.length}. After: ${countAfter}`);
        res.sendStatus(200);
    } catch (e) {
        console.error('error', e);
        res.sendStatus(500);
    }
}*/

function status(req, res) {
    return res.sendStatus(200);
}

database.configure().then(() => {
    // app.use('/import', importUsers);
    app.use('/status', status);
    const server = app.listen(port, () => console.log(`listening on port ${port}`));
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 70000;
    server.on('error', (e) => {
        console.error('Unable to start server:', e.message || e);
    });
}).catch((err) => {
    console.log('failed to configure database', err);
    process.exit(1);
});
