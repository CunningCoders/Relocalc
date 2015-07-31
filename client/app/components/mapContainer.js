var m = require('mithril');
var Location = require('../models/location');
//var loaderView = require('./loader').loader;

/**
 * This ctrl is doing nothing at present
 * @param options
 */

exports.controller = function(options) {
  ctrl = this;
};

/**
 * Please check the muthril docs about the config use below, which is very important
 * for the use of third party libraries
 * @param ctrl
 * @param options
 */

exports.view = function(ctrl, options) {
  //here the options parameter has the lat-lng data from the googleAPI,
  //so we bind it to the mapSet function which runs AFTER the virtual DOM
  //has finished creating the DOM--it allows updating of the DOM after rendering
  return m('.col-sm-6 .mapContainer', {config: mapSetup.bind(null, options) });
};

/**
 * this sets up the Google Map
 * @param options
 * @param element
 * @param isInitialized
 */

function mapSetup(options, element, isInitialized) {

  //we zoom in when a user does a search
  var adjustZoom = function () {
    if (options.location.address()) {
      return 11;
    }
    else {
      return 8;
    }
  };
  //notice that the locations object has m.prop setters/getters which are from a virtual model
  var lat = options.location.lat() || 30.25;
  var lng = options.location.lng() || -97.75;

  console.log(lat, lng);
  console.log(isInitialized);

  var mapCenter = new google.maps.LatLng(lat, lng);
  var mapOptions = {
    center: new google.maps.LatLng(30.2500, -97.7500),
    zoom: adjustZoom(),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  //Map styling
  var map = new google.maps.Map(document.querySelector('.mapContainer'), mapOptions);

  map.set('styles', [
  {
    "stylers": [
      {
        "hue": "#ff1a00"
      },
      {
        "invert_lightness": true
      },
      {
        "saturation": -100
      },
      {
        "lightness": 40
      },
      {
        "gamma": 0.5
      }
    ]
  },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#435359"
        }
      ]
    },
    {
      "featureType": "landscape",
      "stylers": [
        {
          "color": "#2A373C"
        }]
    }
  ]);

    var mapCenter = new google.maps.LatLng(lat, lng);
    var mapOptions = {
      center: new google.maps.LatLng(30.2500, -97.7500),
      zoom: adjustZoom(),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
  var myLatLng = new google.maps.LatLng(lat, lng);

  var marker = new google.maps.Marker({
    //position: mapCenter,
    position: myLatLng,
    map: map,
    icon: '/public/img//house2.png',
    // icon: iconImg,
    title: options.location.address() || ''
  });


  marker.setMap(map);
  google.maps.event.addListener(marker, 'click', toggleBounce);


  function toggleBounce() {

    if (marker.getAnimation() != null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  }

}
