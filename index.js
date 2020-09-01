require('dotenv').config();
require('@google-cloud/debug-agent').start({serviceContext: {enableCanary: false}});
const {database} = require('./db/config/database');


// Express
const express = require("express");
const app = express();
// app.use(cors({
//     origin: '*'
// }));

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080;

const routes = require('./auth/routes');
app.use('/auth', routes.router);

database.configure().then(() => {
    app.listen(port, () => console.log(`listening on port ${port}`));
}).catch((err) => {
    console.log('failed to configure database', err);
    process.exit(1);
});
