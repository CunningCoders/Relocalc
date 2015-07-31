var browserify = require('browserify-middleware');
var bodyParser = require('body-parser');
var search = require('./lib/search.js');
var express = require('express');
var requestPromise = require('request-promise'); // Use for promisified http requests to Zillow
var parser = require('xml2js'); // Parse XML response from Zillow API
var credentials = require('./lib/credentials.js') // git-ignored Zillow API key.
var app = express();
//var db = require('./lib/db.js');
var Restaurant = require('./models/restaurant.js');
var httpResponseBody = require('./lib/httpResponseBody.js');
var calculateLivability = require('./lib/calculateLivability.js');
var request = require('request-promise')

var shared = ['mithril'];
app.get('/js/vendor-bundle.js', browserify(shared));
app.get('/js/app-bundle.js', browserify('./client/app/index.js', { external: shared }));


app.use(bodyParser.json());

// Non-js static files
app.use(express.static('client/public'));

app.get('/', function (req, res){
 return Restaurant.getInspections('2801033')
 .then( function (restaurantList){
   res.json(restaurantList);
 });
});

//app.get('/crimes', function (req, res){});

app.post('/distance', function(req, res){
  request('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + 
  req.body.address+'&destinations='+req.body.workAddress+'&arrival_time=1438610400&key='+ 
  credentials.GoogleDistance, function(error, response, body) {
    if (error) throw error;
    res.send(body)
  })
})

//Init objects for use in Zillow API calls.
var houseData = {};
var neighborhoodURL = '';
var addressOptionsTemplate = {
  uri: 'http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id='+credentials.zillow+'&address=*&citystatezip=Austin+TX',
  method: 'GET'
};var addressOptions = {
  uri: 'http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id='+credentials.zillow+'&address=*&citystatezip=Austin+TX',
  method: 'GET'
};
var neighborhoodOptions = {
  uri: '',
  method: 'GET'
};


app.post('/', function (req, res){
  // Get the street address, remove commas, and replace whitespace with '+' for use in Zillow API
  var zillowAddress = req.body.address.split(' Austin')[0].replace(/\s/g, '+').replace(/\,/,'');
  addressOptions.uri = addressOptionsTemplate.uri.replace(/\*/,zillowAddress);

  function milestoMeters(miles){
    return miles / 0.00062137;
  }
  var circle = {
  	latitude: req.body.lat,
  	longitude: req.body.lng,
  	meters: milestoMeters(req.body.radius || 1) ,
  };
  search('Crime', circle)
  .then(function attachCrimestoHttpResponse(crimes){
  	httpResponseBody.crimes = crimes;
  });
  return search('Restaurant', circle)
  .then(function attachRestaurantsToHttpResponse(restaurants){
  	httpResponseBody.restaurants = restaurants;
  	return httpResponseBody;
  })
  .then(function attachSearchInspectionAvgToHttpResponse(httpResponseBody){
    var count = 0;
    var sum = httpResponseBody.restaurants.reduce(function findInspectionAvgFromSearch(total, rest){
      rest.avg && ++count;
      return rest.avg ? total += rest.avg : total;
    }, 0);
    httpResponseBody.searchInspecAvg = sum / count;
    return httpResponseBody;
  })
  .then(function attachCommuteTime(httpResponseBody) {
    request('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + 
     req.body.address+'&destinations='+req.body.workAddress+'&arrival_time=1438610400&key='+ 
     credentials.GoogleDistance, function(error, response, body) {
      if (error) throw error;
      httpResponseBody.distance = body;
    })
    .then(function(){return httpResponseBody})
    // Make Zillow API call to get address value and neighborhood demographic info
    // Then send httpResponseBody back to client
    .then(function (httpResponseBody) {
      requestPromise(addressOptions)
      // Get the basic info for the requested address
      .then(function(res){
        if(res.search(/Error/g)>0) {
          console.log('No exact match found by Zillow')
        } else {
        //Parse the XML response from Zillow into a JS object
        // NOTE: If the address does not have an exact match in Zillow, the server will bypass the Zillow Data.
          parser.parseString(res, function(err, result) {
            //Unwrap the response the extract the desired data
            if (err) {
              console.log('Parse error')
            } else {
              houseData.summary = result['SearchResults:searchresults']['response'][0]['results'][0]['result']
              houseData.value = houseData.summary[0]['zestimate'][0]['amount'][0]['_']-0 // Using '-0' to implicitly convert the string value to a number
              houseData.neighborhood = {}
              houseData.neighborhood.rid = houseData.summary[0]['localRealEstate'][0]['region'][0]['$']['id']
              houseData.neighborhood.name = houseData.summary[0]['localRealEstate'][0]['region'][0]['$']['name']
              neighborhoodOptions.uri = 'http://www.zillow.com/webservice/GetDemographics.htm?zws-id=X1-ZWz1a5itpkflzf_540hi&rid='+houseData.neighborhood.rid+'&state=TX&city=Austin&neighborhood='+houseData.neighborhood.name.split(' ').join('+');
            }
          })
        }
        return neighborhoodOptions 
      })
      // Get the neighborhood information for the requested address
      .then(function(result){
        if (result.uri===''){
          return 'Zillow Error'
        } else {
          return requestPromise(result)
        }
      })
      // Extract the neighborhood data and insert into httpResponseBody
      .then(function(res){
        if (res !== 'Zillow Error'){
          parser.parseString(res, function(err, result){
            if (result['Demographics:demographics']['response'][0]['pages'][0]['page'][0]['tables'][0]['table'][0]['data'][0]['attribute'][13]['values'][0]['neighborhood']){
              //Property Taxes for neighborhood and Austin average
              houseData.neighborhood.propTaxNeighborhood = result['Demographics:demographics']['response'][0]['pages'][0]['page'][0]['tables'][0]['table'][0]['data'][0]['attribute'][13]['values'][0]['neighborhood'][0]['value'][0]['_']-0 // Using '-0' to implicitly convert the string value to a number
              houseData.neighborhood.propTaxCity = result['Demographics:demographics']['response'][0]['pages'][0]['page'][0]['tables'][0]['table'][0]['data'][0]['attribute'][13]['values'][0]['city'][0]['value'][0]['_']-0
            
              //Median House Size for neighborhood and Austin average
              houseData.neighborhood.houseSizeNeighborhood = result['Demographics:demographics']['response'][0]['pages'][0]['page'][1]['tables'][0]['table'][0]['data'][0]['attribute'][2]['values'][0]['neighborhood'][0]['value'][0]-0 // Using '-0' to implicitly convert the string value to a number
              houseData.neighborhood.houseSizeCity = result['Demographics:demographics']['response'][0]['pages'][0]['page'][1]['tables'][0]['table'][0]['data'][0]['attribute'][2]['values'][0]['city'][0]['value'][0]-0 
              
              //Median Household Income for neighborhood and Austin average
              houseData.neighborhood.medianIncomeNeighborhood = Math.floor(result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][0]['values'][0]['neighborhood'][0]['value'][0]['_'])
              houseData.neighborhood.medianIncomeCity = Math.floor(result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][0]['values'][0]['city'][0]['value'][0]['_'])
              
              //Median Age for neighborhood and Austin average
              houseData.neighborhood.medianAgeNeighborhood = result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][3]['values'][0]['neighborhood'][0]['value'][0]-0 // Using '-0' to implicitly convert the string value to a number
              houseData.neighborhood.medianAgeCity = result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][3]['values'][0]['city'][0]['value'][0]-0

              //% of households with kids for neighborhood and Austin average
              houseData.neighborhood.percentWithKidsNeighborhood = (result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][4]['values'][0]['neighborhood'][0]['value'][0]['_']*100).toFixed(3)-0 //Convert decimal to percentage with 3 decimal places
              houseData.neighborhood.percentWithKidsCity = (result['Demographics:demographics']['response'][0]['pages'][0]['page'][2]['tables'][0]['table'][0]['data'][0]['attribute'][4]['values'][0]['city'][0]['value'][0]['_']*100).toFixed(3)-0 
            }
            // Attach Zillow data to response
            httpResponseBody.zillowData = houseData
          })
        } else {
          httpResponseBody.zillowData = {}
        }
        return httpResponseBody
      })
      // Send response back to client
      .then(function (httpResponseBody){
        var weights = req.body.weights || {restaurants: 50, crimes: 50, affordability: 50};
        calculateLivability(weights, httpResponseBody, req.body.radius);
        res.json(httpResponseBody);
      });
    })
  })
});

var port = process.env.PORT || 4000;
app.listen(port);
console.log("Listening on port", port);

