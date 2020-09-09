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
async function importUsers(req, res) {
    const XLSX = require('xlsx');
    const userRepository = require('./repositories/user');
    const {UniqueConstraintError} = require('sequelize');
    const countBefore = await userRepository.count();
    const duplicates = [];
    console.log(`Users before import: ${countBefore}`);
    try {
        console.log('running import');

        const workbook = XLSX.readFile('import2.xlsx');
        const sheet_name_list = workbook.SheetNames;
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        const usersToInsert = data.length;
        console.log(`Users to import: ${usersToInsert}`);
        for (const user of data) {
            const fields = {
                firstName: user['First Name'],
                lastName: user['Last Name'],
                company: user.Company,
            };
            try {
                await userRepository.create(user.Email, user.Email, null, null, 'audience', JSON.stringify(fields), 4, 'active');
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
}

database.configure().then(() => {
    app.listen(port, () => console.log(`listening on port ${port}`));
    // app.use('/import', importUsers);
}).catch((err) => {
    console.log('failed to configure database', err);
    process.exit(1);
});
