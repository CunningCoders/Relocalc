var m = require('mithril');
var Auth = require('./Auth');
var _ = require('underscore');  //not really needed as it is used only once
var fbUrl = 'https://livability.firebaseio.com/';

/**
 * You shoudld check the Fire base docs to understand the special methods to access data
 * FB allows real-time data binding; we use "once" which does not update the data but
 * it is possible to user the "on" method to have Firebase update as changes are made
 * @type {{userSearches, fetchAllSearchesOfOneUser: Function}}
 */

var Searches = module.exports = {

  userSearches: m.prop([]),

  //This fetches all the searches of a user to desplay them in the SearchList view
  fetchAllSearchesOfOneUser: function(){
    var user = Auth.isAuthenticated() || "undefined";
    var ref = new Firebase(fbUrl + "users/").child(user).child("searches");
    return ref.once("value", function(snapshot){
      Searches.userSearches(_.toArray(snapshot.val()));
      m.redraw();
    })
  }
};
