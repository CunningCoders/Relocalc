//The purpose of this file is to take data--data exported from a spreadsheet and converted to json--and a poplute postsql database
//!! Needs to be ran a single time to populate datavbae. If all data is deleted from the table, it can be ran again.

var db = require('./db.js')
var restaurantArray = require('../data/restaurants.js');
var crimeArray = require('../data/crimes.js')
var Restaurant = require('../models/restaurant.js')
var RestaurantInspection = require('../models/restaurant_inspection.js')
var Crime = require('../models/crime.js')

//This function takes an address string, and returns an object that contains lat, lng, and street name
var parseRestaurantAddress = function (addr){
  var result = {
    street: addr.match(/.*\n.*\n/)[0],
    lat: addr.match(/-?\d{1,3}\.\d*\,/)[0].slice(0,-1),
    long: addr.match(/-?\d{1,3}\.\d*\)/)[0].slice(0,-1),
  };
  return result;
}

//This function takes an object containing data about a restaurant, and inserts an table row
//returns a promise
var insertRestaurant = function(data){
  var addr = parseRestaurantAddress(data.address);
  return Restaurant.create({
    id: data.facility_id.trim(),
    name: data.name.trim(),
    address: addr.street,
    latitude: addr.lat,
    longitude: addr.long,
  });
}

//This function takes an object containing data about a restaurant inspection, and inserts an table row
//returns a promise
var insertRestaurantInspection = function (data){
  return RestaurantInspection.create({
    restaurant_id: data.facility_id.trim(),
    score: data.score.trim(),
    date: data.date.trim(),
  });
}

//This function takes an object containing data about a crime, and inserts an table row
//returns a promise
var insertCrime = function(data){
  return Crime.create({
    id: data.report_number.trim(),
    type: data.crime_type.trim(),
    street: data.address.trim(),
    city_state: 'AUSTIN, TX',
    latitude: data.latitude.trim(),
    longitude: data.longitude.trim()
  });
}

//this function takes a list of objects with resturant info and populates the restaurants and restaurant inepsections tables
var populateRestaurantTables = function (array){
  array.map(function (info) {
    return insertRestaurant(info)
    .then(insertRestaurantInspection)
    .catch(function() {
      insertRestaurantInspection(info)
    })
  })
}

//this function takes a list of objects with crime info and populates the restaurants and crimes table
var populateCrimeTable = function(array){
  array.forEach(function (crime){
    insertCrime(crime)
  });
}

//console.log('populating tables')

populateRestaurantTables(restaurantArray)
populateCrimeTable(crimeArray);
