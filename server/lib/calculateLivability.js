var _ = require('underscore')
var logDebug = function(string){
  var logMessage = 'debugging from file: Relocalc/server/lib/calculateLivibility.js --> '
  return console.log(logMessage + string)
}

//takes an object that has user slider weights, and returns an object with same information.
//The purpose is to make sure the weights add up to 100, but maintains ratios to one another.
var scaleWeights = function(weights){
  var sum = _.reduce(weights, function (tot, weight){
    return tot += +weight;
  }, 0)
  return _.each(weights, function (weight, key){
    weights[key] = weight * 100 / sum;
  })
}

//returns and object containing 2 points and and input. This object is used to evaluate a linear equation
var linEqHandler = function(data, tag){
  switch(tag){
    case 'restaurants':
      return {
        pnt1: {x: data.meanRestInspecAvg, y: 80},
        pnt2: {x: data.meanRestInspecAvg + 5, y: 100}, // For every change of 5 in a health inspection score, the restaurant livability portion changes by 20
        input: data.searchInspecAvg
      };
    case 'crimes':
      return {
        pnt1: {x: data.meanCrimesPerSqMi, y: data.meanCrimesPerSqMi},
        pnt2: {x: data.meanCrimesPerSqMi - 30, y: data.meanCrimesPerSqMi + 12}, // For every change of 30 in crimes/sq mi, the crimes livability portion changes by 12
        input: data.searchCrimesPerSqMi
      };
    case 'commute':
      //Average and lowest average commute based on zipatlas.com
      var commute = JSON.parse(data.distance)
      if (commute.status === "INVALID_REQUEST") {
        return {
           pnt1: {x: 24.6, y: 80}, 
           pnt2: {x: 16.1, y:100},
           input: 24.6
        }
     }
      var input = commute.rows[0].elements[0].duration.value/60
      return {
       pnt1: {x: 24.6, y: 80}, 
       pnt2: {x: 16.1, y:100},
       input: input
      }
    case 'affordability':
      return {
        pnt1: {x: data.zillowData.neighborhood.medianIncomeCity/1000, y: 75},
        pnt2: {x: (data.zillowData.neighborhood.medianIncomeCity*0.5)/1000, y: 100}, // For every change of 10% in income vs city average, the affordability livability portion changes by 2.5
        input: data.zillowData.neighborhood.medianIncomeNeighborhood/1000
    };
  }
}

//takes two points and returns the slope of their connecting line
var slope = function(pnt1, pnt2){
  return (pnt2.y - pnt1.y) / (pnt2.x - pnt1.x)
}

//takes two points and returns the y intercept of their connecting line
var yIntercept = function(pnt1, pnt2){
  m = slope(pnt1, pnt2)
  return m === Infinity ? pnt1.x : pnt1.y - m * pnt1.x;

}
//calculates mx + b in order to decide a score for an input value
//handler contains necessary info
var linEq = function(handler){
  var m = slope(handler.pnt1, handler.pnt2)
  var x = handler.input
  var b = yIntercept(handler.pnt1, handler.pnt2)
  return m * x + b;

}

//this function call evaluates the value of LinEq
//The purpose is to provide linEq w/ the correct handler, and to keep the score in the range 0-100
var calculateScore = function(handler, weight){
  var score = linEq(handler);
  return score < 0 ? 0 :
    score > 100 ? weight * 100 : score * weight
}

module.exports = 
  function attachStatsToHttpResponeBody(weights, httpResponseBody, radius){
    httpResponseBody.searchCrimesPerSqMi = (httpResponseBody.crimes.length / (Math.PI * radius * radius));  
    httpResponseBody.livibility = _.reduce(scaleWeights(weights), function findPartialLivibility(score, val, key){
  	return score += calculateScore(linEqHandler(httpResponseBody, key), val/100)
  }, 0);
}