var m = require('mithril');
var Location = require('../models/Location');
var Relocalc = require('../index');

exports.controller = function (options) {
  ctrl = this;
  /**
   * this function in Location.js model; makes a post request to GoogleAPI for coordinates for the address, which are
   * then used for a post request to our database for the data for radius around location
   */
  ctrl.fetchData = function() {
    ctrl.fetchGeoCode()
  }

  ctrl.fetchGeoCode = function() {
    var address = options.location.address();
    var workAddress = options.location.workAddress();
    return Location.postToFetchRestaurantData(address, workAddress, function cb(res) {
      //set values on vm
      options.location.lng(res.lng);
      options.location.lat(res.lat);
      //IMPORTANT: force a re-render so the graphs display with the new values!
      if (res !== null) {
        m.redraw();
        toastr["success"]("Data successfully loaded for " + address);
      };
    });
  };
};

exports.view = function (ctrl, options) {
  return m('.row', [
    m('.card-holder',[
  m('.addressInput-card',[
      [m('h1',  "Search Austin addresses to find your perfect spot.")],
        [m('form[role="form", type="post"]', {onsubmit: ctrl.fetchGeoCode},
            [m('input.addressInput.address[type="text"][placeholder="Enter an Austin address (Example: 700 San Jacinto, Austin, TX 78701)"]',
              {value: options.location.address(),
                //this could be refactored to to use m.withAttr to set the values...
              onchange: function(e){ options.location.address(e.currentTarget.value); }}
            )],
              [m('input.addressInput.workAddress[type="text"][placeholder="Enter your work address (1100 Congress Avenue, Austin, TX 78701)"]',
                {value: options.location.workAddress(),
                  //this could be refactored to to use m.withAttr to set the values...
                onchange: function(e){ options.location.workAddress(e.currentTarget.value); }}
            )],
            [m('h3',  "On a scale of 0-100, how important are these criteria in your search?")],
                [m('.col-sm-6',
                  [m('h4', 'Crime Rate: ' + Location.crimeWeight())],
                    [m('.slider',
                      [m('input[type="range"]'
                        ,{min: 0, max: 100, step: 1, value: Location.crimeWeight(), onchange: m.withAttr('value', Location.crimeWeight)}
                      )]
                    )]
                )],
                [m('.col-sm-6',
                  [m('h4', 'Food Safety: ' + Location.restWeight())],
                    [m('.slider',
                      [m('input[type="range"]'
                        ,{min: 0, max: 100, step: 1, value: Location.restWeight(), onchange: m.withAttr('value', Location.restWeight)}
                      )]
                    )]
                )],              
                [m('.col-sm-6',
                  [m('h4', 'Commute Time: ' + Location.commuteWeight())],
                    [m('.slider',
                      [m('input[type="range"]'
                        ,{min: 0, max: 100, step: 1, value: Location.commuteWeight(), onchange: m.withAttr('value', Location.commuteWeight)}
                      )]
                    )]
                )],
                [m('.col-sm-6',
                  [m('h4', 'Affordability: ' + Location.costWeight())],
                    [m('.slider',
                      [m('input[type="range"]'
                        ,{min: 0, max: 100, step: 1, value: Location.costWeight(), onchange: m.withAttr('value', Location.costWeight)}
                      )]
                    )]
                )],
            [m('input.addressInput.addressInput-submit[type="submit"][value="Try your luck"]')] //input form
        ),  //form-group
      ] //form
    ])//searchBox
  ])
  ])
};

