module.exports = {
  query: query,
};

const Pool = require("pg").Pool;

const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql";

function query(queryString, cbFunc) {
  const pool = new Pool({
      user: process.env.CLOUD_SQL_USERNAME,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      host: `${dbSocketPath}/${process.env.CLOUD_SQL_INSTANCE}`
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