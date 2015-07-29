
exports.up = function(knex, Promise) {
  return Promise.all([ 
    knex.schema.createTable('dogs', function (table){
        table.string('id').primary();
        table.string('first_name');
        table.string('zip_code');
        table.string('location');
        table.string('description_of_dog');
        table.string('address');
        table.string('last_name');
        table.timestamps();
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('dogs')
  ])
};
