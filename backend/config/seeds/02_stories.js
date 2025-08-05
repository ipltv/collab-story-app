/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('stories').del();

  await knex('stories').insert([
    {
      id: 1,
      title: 'The Mysterious Forest',
      content: 'Once upon a time, deep in the forest...',
      author_id: 1,
    },
    {
      id: 2,
      title: 'Space Adventures',
      content: 'Captain Nova entered the wormhole...',
      author_id: 2,
    },
  ]);
};
