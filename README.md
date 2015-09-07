[![Stories in Ready](https://badge.waffle.io/CunningCoders/Relocalc.png?label=ready&title=Ready)](https://waffle.io/CunningCoders/Relocalc)
# Livability

A resource for residents or businesses looking to move to Austin, TX. 
Let the app calculate a livability score for the area of your interest.

## Overview

Livability is a Mithril/Express/Postgres/Browserify web application that taps into various Austin Open Data APIs using data from the [City of Austin Data Portal] (http://data.austintexas.gov).
Each address will produce a livability score based on an algorithm which uses the available data.
The end user will be able to compare the results of particular data for an address entered with Austin averages.
In addition, the user will be able to scale the importance of each element to receive a weighted result depending on 
the user's own priorities. 

![Screen Shot 1](https://s3-us-west-2.amazonaws.com/github-imgs/livability/Livability1.png)
![Screen Shot 2](https://s3-us-west-2.amazonaws.com/github-imgs/livability/Livability3.png)
![Screen Shot 3](https://s3-us-west-2.amazonaws.com/github-imgs/livability/Livability2.png)
```
+--client/
├── index.js - main view and routes 
├── components
│   ├── *.js       
│   
│
├── models
│   │
│   ├── Auth.js
│   ├── Location.js
│   └── Searches.js
│
├── public
│   └── index.html  - main html file
│   └── style.css   - compiled styles (don't touch)
│   └── sass
         └── .scss - write your styles here to be compiled to style.css

    
server/                         
│                          
│── data
|    └── crimes, restaurants.js   - the json data that populates the database
│── lib
|     └── search.js
|
│── models 
│   └──  *.js
│
└── index.js   - node server file
.jshintrc
gulpfile.js
knexfile.js
package.json
README
```

## Getting Started

### From the terminal:

Install Postgres:

```
brew install postgres
```

Set up the database & compile CSS for the first time (from the Livability root directory):

```
./setupDatabase.bash
``` 

Repopulate the database tables (only needs to be done if rows are deleted from all tables):
```
node server/db/populateDb.js
```

Start the server: 

```
gulp start
```

To recompile css, you must stop the server and run: 

```
gulp sass
```
## Other Resources
* [Highcharts](http://www.highcharts.com/docs/getting-started/your-first-chart) - used for displaying the search results data.
* [Knex](http://knexjs.org/) - used to migrate data when adding new tables.
* [GeoLib] (https://github.com/manuelbieh/Geolib) - used for geospatial calculations (e.g. comparing database entries within a geographic radius.)
* [Firebase] (https://www.firebase.com/docs/) - used for user authentication, storing user sessions, and storing a user's previous searches.
