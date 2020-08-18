const bcrypt = require('bcrypt');
let pgPool;

module.exports = (injectedPgPool) => {
    pgPool = injectedPgPool;

    return {
        register: register,
        getUser: getUser,
        isValidUser: isValidUser,
    };
};

async function register(username, password, userType, userFields, cbFunc) {
    try {
        const encPass = await bcrypt.hash(password, 10);
        const fields = JSON.parse(userFields);

        const query = `INSERT INTO users (username, user_password, user_type, fields) VALUES ('${username}', '${encPass}', '${userType}', '${JSON.stringify(fields)}') RETURNING *`;

        return pgPool.query(query, cbFunc);
    } catch (error) {
        console.log(error);
        return error;
    }
}

function getUser(username, password, cbFunc) {
    const getUserQuery = `SELECT * FROM users WHERE username = '${username}'`;

    pgPool.query(getUserQuery, async (response) => {
        let found = false;
        if (response.results.rowCount === 1) {
            const matched = await bcrypt.compare(password, response.results.rows[0].user_password);
            if (matched) {
                found = true;
            }
        }
        cbFunc(
            response.error,
            response.results && response.results.rowCount === 1 && found ?
              response.results.rows[0]
              : null
        );
    });
}

function isValidUser(username, cbFunc) {
    const query = `SELECT * FROM users WHERE username = '${username}'`;

    const checkUsrcbFunc = (response) => {
        const isValidUser = response.results ?
          (response.results.rowCount === 0)
          : null;

        cbFunc(response.error, isValidUser);
    };

    pgPool.query(query, checkUsrcbFunc);
}