/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('stories', function (table) {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('content').notNullable();
        table.integer('author_id').unsigned().notNullable();
        table.foreign('author_id').references('users.id').onDelete('CASCADE');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('stories');
};
