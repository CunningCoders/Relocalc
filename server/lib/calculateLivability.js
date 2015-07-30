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
        pnt2: {x: data.meanRestInspecAvg + 5, y: 100},
        input: data.searchInspecAvg
      };
    case 'crimes':
      return {
        pnt1: {x: data.meanCrimesPerSqMi, y: data.meanCrimesPerSqMi},
        pnt2: {x: data.meanCrimesPerSqMi - 30, y: data.meanCrimesPerSqMi + 12},
        input: data.searchCrimesPerSqMi
      };
      //case for dogs - added by BS
  //   case 'dogs':
  //     return {
  //       pnt1: {x: data.meanDogsPerSqMi, y: data.meanDogsPerSqMi},
  //       pnt2: {x: data.meanDogsPerSqMi - 30, y: data.meanDogsPerSqMi + 12},
  //       input: data.searchDogsPerSqMi
  //     };
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

module.exports = function attachStatsToHttpResponeBody(weights, httpResponseBody, radius){
  httpResponseBody.searchCrimesPerSqMi = (httpResponseBody.crimes.length / (Math.PI * radius * radius));
  // httpResponseBody.searchDogsPerSqMi = (httpResponseBody.dogs.length / (Math.PI * radius * radius)); //added this - BS   
  httpResponseBody.livibility = _.reduce(scaleWeights(weights), function findPartialLivibility(score, val, key){
  	return score += calculateScore(linEqHandler(httpResponseBody, key), val/100)

  }, 0);
}