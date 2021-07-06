
exports.up = function(knex) {
  return knex.schema.createTable('users', tbl => {
      tbl.increments();

      tbl
        .string('username', 40)
        .notNullable()
        .unique();

      tbl
        .string('password', 40)
        .notNullable()
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
