let userDB;

module.exports = (injectedUserDB) => {
    userDB = injectedUserDB;

    return {
        registerUser: registerUser,
        login: login,
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

function login(query, res) {}

function sendResponse(res, data, status=200, error=null) {
    res.status(status).json({
        ...data,
        error,
    });
}