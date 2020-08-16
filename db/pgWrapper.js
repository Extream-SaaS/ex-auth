module.exports = {
  query: query,
};

const Pool = require("pg").Pool;

function query(queryString, cbFunc) {
  const pool = new Pool({
      user: "postgres",
      host: "35.246.19.80",
      database: "ex-manage",
      password: "4cDzu3f1K1qjq1zp4cDzu3f1K1qjq1zp",
      port: 5432,
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