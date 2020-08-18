let userDB, tokenDB;

module.exports = (injectedUserDB, injectedTokenDB) => {
    userDB = injectedUserDB;
    tokenDB = injectedTokenDB;

    return {
        registerUser: registerUser,
        login: login,
        getUser: getUser,
    };
};

function registerUser(req, res) {
    userDB.isValidUser(req.body.username, (error, isValidUser) => {
        if (error) {
            sendResponse(res, { message: 'bad request' }, 400, error);
            return;
        }

        if (!isValidUser) {
            sendResponse(res, { message: 'user exists' }, 409);
            return;
        }

        userDB.register(req.body.username, req.body.password, req.body.user_type, req.body.user, (response) => {
            sendResponse(
                res,
                response.error === undefined ? { response } : { message: 'bad request'},
                response.error === undefined ? 200 : 400,
                response.error
            );
        });
    });
}

function getUser(req, res) {
    const bearerToken = req.headers.authorization.split('Bearer ')[1];
    tokenDB.getUserIDFromBearerToken(bearerToken, (userID) => {
        userDB.getUserByID(userID, (response) => {
            const { public_id, username, fields } = response.results.rows[0];
            sendResponse(
                res,
                response.error === undefined ? { id: public_id, username, fields } : { message: 'not authorized' },
                response.error === undefined ? 200 : 401,
                response.error
            );
        });
    });
}

function login(query, res) {}

function sendResponse(res, data, status=200, error=undefined) {
    res.status(status).json({
        ...data,
        error,
    });
}