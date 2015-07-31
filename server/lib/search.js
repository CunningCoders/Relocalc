//This file exports a single function
//The function takes a table name and a circle object (point(lat,lng), radius)
//The function returns a list of table entries that are inside of the given circle

var Crime = require('../models/crime.js');
var Restaurant = require('../models/restaurant.js');
var Promise = require('bluebird');
var geolib = require('geolib')

//function allows search to be called on multiple tables
//returns an object containing appropratie functions for given model name
var handler = function (modelName){
  switch(modelName){
    case 'Restaurant':
      return {
        table: Restaurant,
        reduce: reduceRestaurants
      };
    case 'Crime':
      return {
        table: Crime,
        reduce:  reduceCrimes
      };
  }
}

//function takes a list of all db crimes and a circle
//returns a promise for a list of crimes within the circle
var reduceCrimes = function (crimes, circle){
  return Promise.reduce(crimes, function findCrimesInsideCircle(accum, cur){
  	var restCoords = {
  		latitude: cur.latitude,
  		longitude: cur.longitude,
  	}
  	//what Adam calls a "poor man's if"
  	//if crime is inside circle, push it into the accumulated array
  	geolib.isPointInCircle(restCoords, circle, circle.meters) && accum.push({
  	  type: cur.type,
  	  lat: cur.latitude,
  	  lng: cur.longitude,
  	});
  	return accum;
  }, [])
};

//function takes a list of all db restaurants and a circle
//returns a promise for a list of restaurants and their insepctions within the circle
var reduceRestaurants = function (restaurants, circle){
  //return promise for filtered list based of restaurants based on proximity
  return Promise.filter(restaurants, function findRestaurantsInsideCircle(restaurant){
  	var restCoords = {
  		latitude: restaurant.latitude,
  		longitude: restaurant.longitude,
    }
  	return geolib.isPointInCircle(restCoords, circle, circle.meters);
  })
  
  //take that list from promise, then map that list to a new list (change is described in nex comment)
  .then(function (stored){
  	return Promise.map(stored, function findRestaurantInspections(rest){
  		
  		//return a promise for a list of inspections for each restaurant in list
  		return Restaurant.getInspections(rest.id)
  		.then(function(inspecs){
  			var sum = inspecs.reduce(function findInspectionScoreSum(accum, elm){
  			  return accum += elm.score;
  			}, 0);
  			return {
		  	  name: rest.name,
			    address: rest.address,
			    lat: rest.latitude,
			    lng: rest.longitude,
			    inspections: inspecs,
			    avg: sum / inspecs.length,
  			}
  		})
  	})
  })
};

//export function described at first line of file
module.exports =  function(table, coords){
  var handle = handler(table);
  return handle.table.all()
  .then(function callReduceTable(rows){
  	return handle.reduce(rows, coords);
  })
}
