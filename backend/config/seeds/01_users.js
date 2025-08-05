const bcrypt = require('bcrypt');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
    const password_hash = await bcrypt.hash('123', 10);
    await knex('users').del();
    await knex('users').insert([
        {
            id: 1,
            username: 'alice',
            email: 'alice@example.com',
            password_hash,
        },
        {
            id: 2,
            username: 'bob',
            email: 'bob@example.com',
            password_hash,
        },
        {
            id: 3,
            username: 'charlie',
            email: 'charlie@example.com',
            password_hash,
        },
    ]);
};
