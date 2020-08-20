// Database imports
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const pgPool = require("./db/pgWrapper");
const tokenDB = require("./db/tokenDB")(pgPool);
const userDB = require("./db/userDB")(pgPool);

require('@google-cloud/debug-agent').start({serviceContext: {enableCanary: false}});

// OAuth imports
const oAuthService = require("./auth/tokenService")(userDB, tokenDB);
const oAuth2Server = require("node-oauth2-server");

// Express
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: '*'
}));
app.oauth = oAuth2Server({
    model: oAuthService,
    grants: ["password"],
    debug: true,
});

// Auth and routes
const authenticator = require("./auth/authenticator")(userDB, tokenDB);
const routes = require("./auth/routes")(
    express.Router(),
    app,
    authenticator
);
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(app.oauth.errorHandler());
app.use("/auth", routes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});