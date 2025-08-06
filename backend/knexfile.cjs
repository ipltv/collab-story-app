console.log('Knexfile is being executed');
const path = require("path");

console.log(path.join(__dirname, "./config/migrations"));
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';


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
  test: {
    client: "pg",
    connection: DATABASE_URL,
    migrations: {
      directory: path.join(__dirname, "./config/migrations"),
      tableName: "knex_migrations",
    },
    seeds: {
      directory: path.join(__dirname, "./config/seeds"),
    }
  },
};

module.exports = config[NODE_ENV] || config.development;
