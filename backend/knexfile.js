console.log('Knexfile is being executed');
const path = require("path");
const { DATABASE_URL } = require("./config/env.js");

console.log(path.join(__dirname, "./config/migrations"));


const config = {
  development: {
    client: "pg",
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    },
  },
  production: {
    client: "pg",
    connection: DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    },
  },
};

module.exports = config;