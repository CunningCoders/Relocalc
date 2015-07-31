
Post({
  "address": "3308 Webberville/Bedford, Austin, TX 78702",
    "lat":"30.269527",
    "lng":"-97.70707990099999",
    "radius": 1,
    "weights": {"restaurants": 46, "crimes": 34}
  
  })
//single object that will be sent to client
//has 2 keys that hold all table entries within range of posted address: restaurants, crimes
res.body = {
	//crimecount can be found: data.crimes.length
	'crimes': [
      {
    	'type': 'FOUND PROPERTY'
	  	'lat':'30.26678154'
		'long':'97.73824996'
	  },

	//points to an array of restaurant objects.
	//find restaurant count by: data.restaurants.length
	//each restaurant object will have an 'inspections' key that points to its own array of insepction objects
	//avg key points to the avg inspection store for a given restaurant;
	'restaurants': [
	  {
	  	'name': '15th Street Cafe',
	  	'address': '303 W 15TH ST AUSTIN, TX 78701',
	  	'lat': '30.277553492000038',
	  	'lng': '-97.74209889799994',
	  	'inspections': [
	  	  {
	  	  	'date': '2014-06-18'
	  	  	'score': '97'
	  	  },
	  	  {
	  	  	'date': "2015-05-13"
	  	  	'score': "97"
	  	  },
	  	],
	  	'avg' : 97,
	  },
	  {
	  	'name': '1st Food Mart',
	  	'address': '1410 S 1ST ST , TX 78704',
	  	'lat': '30.277553492000038',
	  	'lng': '-97.74209889799994',
	  	'inspections': [
	  	  {
	  	  	'date': '2014-06-18'
	  	  	'score': '93'
	  	  },
	  	],
	  	"avg": 93
	  },
	],
	//not 95.6667 bc we're taking the avg of restaurant avgs
	
	],
}