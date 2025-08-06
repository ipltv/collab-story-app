/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('contributors').del();

  await knex('contributors').insert([
    {
      id: 1,
      story_id: 1,
      user_id: 2, // Bob contributes to Alice's story
    },
    {
      id: 2,
      story_id: 1,
      user_id: 3, // Charlie too
    },
    {
      id: 3,
      story_id: 2,
      user_id: 1, // Alice contributes to Bob's story
    },
  ]);
};
