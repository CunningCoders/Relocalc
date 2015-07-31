//This file initializes the graphs for Crime Score, Restaurant Score, and Number of Restaurants

var m = require('mithril');

//All data for populating the graphs comes from Location.search()
var Location = require('../models/Location');

exports.controller = function(options) {
  ctrl = this;
  
  ctrl.initCrime = function (element, isInit, context) {
    
    //Initialize crime chart
    $(function () { 
      $('.crimeGraph').highcharts({
        colors: ['#7A878B', '#434348'],
        chart: {
          type: 'column',
          spacing: 50,
        },
        title: {
          text: 'Crime Rate (Adjusted)'
        },
        xAxis: {
          categories: ['']
        },      
        yAxis: {
          title: {
            text: 'Crimes Reported: Jan 2015 - Present'
          }
        },
        series: [{
          name: 'Your Search',
          data: [Math.floor(Location.search().crimeAvg)]
        }, {
          name: 'City of Austin (average)',
          data: [Math.floor(Location.search().cityCrimeAvg)]
        }],
        //Info that appears when you hover over a column
        tooltip: {
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
            '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
        },
        credits: {
          enabled: false
        }
      });
    });
  };

  ctrl.initRestSafety = function (element, isInit, context) {

    //Initialize restaurant safety chart
    $(function () { 
      $('.restaurantSafety').highcharts({
        colors: ['#7A878B', '#434348'],
        chart: {
          type: 'column',
          spacing: 50
        },
        title: {
          text: 'Restaurant Score (Adjusted)'
        },
        xAxis: {
          categories: ['']
        },
        yAxis: {
          title: {
            text: 'Average Health Inspection Rating (2015)'
          }
        },
        series: [{
          name: 'Your Search',
          data: [Math.floor(Location.search().restAvg)]
        }, {
          name: 'City of Austin (average)',
          data: [Math.floor(Location.search().cityRestAvg)]
        }],
         tooltip: {
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
              '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
        },
        credits: {
          enabled: false
        }
      });
    });
  };

  ctrl.initRestNumber = function (element, isInit, context) {

    //Initialize number of restaurants chart
    $(function () { 
      $('.restaurantNumber').highcharts({
        colors: ['#7A878B', '#434348'],
        chart: {
          type: 'column',
          spacing: 50
        },
        title: {
          text: 'Number of Restaurants'
        },
        xAxis: {
          categories: ['']
        },
        yAxis: {
          title: {
            text: 'Restaurants per square mile'
          }
        },
        series: [{
          name: 'Your Search',
          data: [Location.search().restaurants]
        }, {
          name: 'City of Austin (average)',
          data: Location.search().restaurants ? [51] : [0]
        }],
         tooltip: {
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
            '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
        },
        credits: {
          enabled: false
        }
      });
    });
  };

  ctrl.initCommuteTime = function (element, isInit, context) {

    //Initialize restaurant safety chart
    $(function () { 
      $('.commuteTime').highcharts({
        colors: ['#7A878B', '#434348'],
        chart: {
          type: 'column',
          spacing: 50
        },
        title: {
          text: 'Commute Time'
        },
        xAxis: {
          categories: ['']
        },
        yAxis: {
          title: {
            text: 'Average Commute Time (2015)'
          }
        },
        series: [{
          name: 'Your Search',
          data: [Location.commuteTime()]
        }, {
          name: 'City of Austin (average)',
          data: [24.6]
        }],
         tooltip: {
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
            '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
        },
        credits: {
          enabled: false
        }
      });
    });
  };

  ctrl.initCostCompare = function (element, isInit, context) {

    //Initialize number of restaurants chart
    $(function () { 
      $('.costCompare').highcharts({
        colors: ['#7A878B', '#434348'],
        chart: {
          type: 'column',
          spacing: 50
        },
        title: {
          text: 'Median Neighborhood Income'
        },
        xAxis: {
          categories: ['']
        },
        yAxis: {
          title: {
            text: 'Yearly Income (average)'
          }
        },
        series: [{
        name: 'Your Search',
          data: [Location.zillowIncomeNeighborhood()]
        }, {
        name: 'City of Austin (average)',
          // data: [Location.search().restaurants]
          data: [Location.zillowIncomeCity()]
        }],
        tooltip: {
          useHTML: true,
          headerFormat: '<small>{point.key}</small><table>',
          pointFormat: '<tr><td style="color: {series.color}">{series.name}: </td>' +
            '<td style="text-align: right"><b>{point.y}</b></td></tr>',
          footerFormat: '</table>',
        },
        credits: {
          enabled: false
        }
      });
    });
  };

  
};

exports.view = function(ctrl, options) {
 return  m('div', 
    [m('.col-sm-4 .crimeGraph', {config: ctrl.initCrime}),
     m('.col-sm-4 .restaurantSafety', {config: ctrl.initRestSafety}),
     m('.col-sm-4 .restaurantNumber', {config: ctrl.initRestNumber}),
     m('.col-sm-4 .commuteTime', {config: ctrl.initCommuteTime}),
     m('.col-sm-4 .costCompare', {config: ctrl.initCostCompare}),
    ]);
};



