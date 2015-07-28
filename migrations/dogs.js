
exports.up = function(knex, Promise) {
  return Promise.all([ 
  	knex.schema.createTable('dogs', function (table){
        table.string('id').primary(); //not in original data
        table.string('first_name');
        table.string('last_name');
        table.string('address');
        table.string('zip_code');
        table.string('description_of_dog');
        table.timestamps();
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
  	knex.schema.dropTable('dogs')
  ])
};