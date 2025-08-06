import knex from 'knex';
import { DATABASE_URL } from '../config/env.js';

const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

export default db;
