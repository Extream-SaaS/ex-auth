module.exports = {
  query: query,
};

const Pool = require("pg").Pool;

const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql";

function query(queryString, cbFunc) {
  const pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: `${dbSocketPath}/${process.env.INSTANCE_CONNECTION_NAME}`
  });

  pool.query(queryString, (error, results) => {
      cbFunc(setResponse(error, results));
  });
}

function setResponse(error, results) {
  return {
      error: error,
      results: results ? results : null,
  };
}