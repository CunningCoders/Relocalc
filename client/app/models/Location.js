var m = require('mithril');
var Auth = require('./Auth');
var fbUrl = 'https://craply.firebaseio.com/';
var maps = 'https://maps.googleapis.com/maps/api/geocode/';

/**
 * replaces blank spaces in submitted address with "+" per the Google API docs (not absolutely needed)
 * @param address
 * @returns {string}
 */

var addressFormatter = function(address) {
  var newAddress = "";
  for (var i = 0; i < address.length; i++){
    if (address[i] === " "){
      newAddress += "+";
    } else{ newAddress += address[i];}
  }
  return newAddress;
};

/**
 * model serves Relocalc (main component), which passes the data down to its children in searchBox & map
 */

var Locations = module.exports = {

  search: m.prop({}),

  postToFetchGeoCode: function(address, callback){
    return m.request({method: "POST", url: maps + 'json?address=' + addressFormatter(address)})
        .then(function(res){
          callback(res);
        });
  },

  lat: m.prop(''),
  lng: m.prop(''),
  crimeWeight: m.prop(''),
  restWeight: m.prop(''),
  dogWeight: m.prop(''), //dog weight for weight gauge?
  address: m.prop(''),

  postToFetchRestaurantData: function(address, cb) {
    Locations.address(address);
    var cb = cb;
    this.postToFetchGeoCode(address, function (res) {
      console.log("google", res);
      Locations.lat(res.results[0].geometry.location.lat);
      Locations.lng(res.results[0].geometry.location.lng);
      var locationData = {
        "address": address,
        "lat": res.results[0].geometry.location.lat,
        "lng": res.results[0].geometry.location.lng,
        "radius": 1,
        "weights": {
          "crimes": Locations.crimeWeight() || 50,
          "restaurants": Locations.restWeight() || 50
        }
      };
      console.log(locationData);
      return m.request({method: "POST", url: "", 'Content-Type': 'application/json', data: locationData})
        .then(function(res) {
          console.log(res);
          console.log(Object.keys(res));
          var data = modelData(res);
          if (data !== null) {
            Locations.search(data);
          }
            Locations.saveSearch(Locations.address(), res.livibility);
            return cb(data);
        })
    });
  },

  saveSearch: function(address, livabilityScore){
    var user = Auth.isAuthenticated();
    if(user) {
      var ref = new Firebase(fbUrl + "users/" + user);
      var searchRef = ref.child("searches");
      var search = {
        "address": address,
        "livability": livabilityScore
      }
      searchRef.push(search, function (error) {
        if (error) {
          console.log("Search data could not be saved to FB" + error);
        } else {
          console.log("Search saved successfully to FB.");
        }
      })
    }
  },

  vm: function(){
    return {
      address: m.prop(''),
      lat: m.prop(''),
      lng: m.prop('')
    }
  }

};

/**
 * This does a little work on the data returned from the server before sending it to the views
 * @param data
 * @returns {Object}
 */

var modelData = function(data) {
  //Separate data into variables
  var inspectCount = 0;   

  var sum = data.restaurants.reduce(function(tot, rest){
    if(rest.avg) {
      tot += rest.avg;
      inspectCount++;
    }
    return tot;
  }, 0);

  var avg = sum / inspectCount;

  var response = {
    crimes: data.crimes.length,
    restaurants: data.restaurants.length,
    lat: Locations.lat(),
    lng: Locations.lng(),
    restAvg: data.searchInspecAvg,
    crimeAvg: data.searchCrimesPerSqMi,
    dogAvg: data.searchDogsPerSqMi, //added this - BS
    livability: data.livibility,
    cityRestAvg: data.meanRestInspecAvg,
    cityCrimeAvg: data.meanCrimesPerSqMi
  };

  if(isNaN(response.restAvg)) {
    toastr["error"]("No available data. Please check that the address");
    return null;
  } else {
    return response;
  }
};