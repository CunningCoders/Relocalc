var m = require('mithril');
var SearchBox = require('./components/searchBox');
var SigninBox = require('./components/signinBox');
var Map = require('./components/mapContainer');
var SearchList = require('./components/searchList');
var Signup = require('./components/signup');
var Gauge = require('./components/livabilityGauge');
var Graphs = require('./components/graphContainer');
var About = require('./components/about');
var Location = require('./models/Location');
var Auth = require('./models/Auth');

window.Relocalc = {};

/**
 * The controller here creates a virtual model from Location which is passed into
 * the map so that it has access to the lat & lng to render the map
 */

Relocalc.controller = function () {
  var ctrl = this;
  ctrl.location = Location.vm();
};

Relocalc.view = function (ctrl) {
  return m('div',
          [m('.row', [ m.component(SigninBox) ]),
           m('.row .headline', 'Relocalc'),
           m('.row', [ m.component(SearchBox, { location: ctrl.location }) ]),
           m('.resultsHeadline', 'Your Results'),
           m('.row', [ m.component(Map, { location: ctrl.location }), m.component(Gauge) ]),
           m('.row', [ m.component(Graphs) ])    
          ])
}

/**
 * ROUTING
 */

m.route.mode = "hash";

m.route(document.getElementById('app'), "/", {
  "/": Relocalc,
  "/signup": Signup,
  "/about": About,
  "/searches/:userID": SearchList
});