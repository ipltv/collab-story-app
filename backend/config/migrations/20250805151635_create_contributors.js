/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('contributors', function (table) {
        table.increments('id').primary();
        table.integer('story_id').unsigned().notNullable();
        table.foreign('story_id').references('stories.id').onDelete('CASCADE');
        table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('contributors');
};
