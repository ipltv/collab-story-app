/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.alterTable('stories', function (table) {
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

    await knex.raw(`
    CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;`);
    await knex.raw(`DROP FUNCTION IF EXISTS update_updated_at_column;`);

    await knex.schema.alterTable('stories', function (table) {
        table.dropColumn('updated_at');
    });
};
