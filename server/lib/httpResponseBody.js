//the purpose of this file is to attach information to the body that will be sent in response to a Post request

var Restaurant = require('../models/restaurant.js')
var Crime = require('../models/crime.js')
var Dog = require('../models/dogs.js')
var Promise = require('bluebird')
var _ = require('underscore')
var httpResponseBody = module.exports = {name: 'httpResponseBody'}
var _areaOfAustin = 264.9 //sqare miles

//calculates mean inspection average for all restaurants in database, and attaches them to httpResponseBody
Restaurant.all()
.then(function getRestuarantInspectionScoreSum(restaurants){
	httpResponseBody.meanRestInspecAvg = 0;
	var len = restaurants.length;
	var count = 0
	return Promise.map(restaurants, function getInspections(elm){
		return Restaurant.getInspections(elm.id)
		.then (function getInspectionsAvg(inspections){
			return inspections.reduce(function (tot, inspec){
				return tot += inspec.score;
			}, 0) / inspections.length
		})
		.then(function accumAvg(inspecAvg){
			//console.log('( '+ (count++) +', ' + inspecAvg + ')')
			!inspecAvg && --len;
			return !inspecAvg ? httpResponseBody.meanRestInspecAvg : httpResponseBody.meanRestInspecAvg += inspecAvg ;
		})
	})
	.then(function attachMeanRestInpecAvgToResponse(restaurants){
		httpResponseBody.meanRestInspecAvg /= len;
	})
})

//calculates adjusted crimes per square mile of all crimes in database, and attaches them to httpResponseBody
Crime.all()
.then(function attachMeanCrimesPerSqMiToResponse(crimes){
	httpResponseBody.meanCrimesPerSqMi = crimes.length/_areaOfAustin * 4
})

//calculate dogs per square mile of all dogs in DB & attach them to httpResponseBody
Dog.all()
.then(function attachMeanDogsPerSqMiToResponse(dogs){
	httpResponseBody.meanDogsPerSqMi = dogs.length/_areaOfAustin * 4
})