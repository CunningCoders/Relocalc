var m = require('mithril');
var SearchBox = require('./components/searchBox');
var SigninBox = require('./components/signinBox');
var Map = require('./components/mapContainer');
var SearchList = require('./components/searchList');
var Signup = require('./components/signup');
var Gauge = require('./components/livabilityGauge');
var Crime = require('./components/crimeGraph');
var RestaurantSafety = require('./components/restaurantSafety');
var RestaurantNumber = require('./components/restaurantNumber');
var Location = require('./models/Location');

window.Relocalc = {};

Relocalc.controller = function () {
  var ctrl = this;
  ctrl.location = Location.vm();
};

Relocalc.view = function (ctrl) {
  return [
    // m.component(SigninBox),
    m.component(SearchBox, { location: ctrl.location }),
    m.component(Map, { location: ctrl.location }),
    m.component(Gauge),
    m.component(Crime),
    m.component(RestaurantSafety),
    m.component(RestaurantNumber)

  ]
}

/**
 * ROUTING
 */

m.route.mode = "hash";

m.route(document.getElementById('app'), "/", {
  "/": Relocalc,
  "/signup": Signup,
  "/searches/:userID": SearchList
});
