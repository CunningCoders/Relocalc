var m = require('mithril');
var host = "localhost:4000";
var fb = 'https://livability.firebaseio.com/';
var ref = new Firebase(fb);

/**
 * Global getter (checkUser) to access a local object with the current authenticated userID
 * This allows you to check in who is logged in without a call to Firebase (useful when updating
 * view states on the fly)
 */

var LoggedIn = {};
LoggedIn.userID = null;

window.checkUser = function() {
  return LoggedIn.userID;
};

// onAuth is a Firebase method that triggers if there is a change in the status of the authentication status



ref.onAuth(function(authData) {
  if (authData) {
    console.log("Authentication state update (+)" + authData);
    return LoggedIn.userID = authData.uid;
  }
  console.log("Authentication state update (-)" + authData);
  return LoggedIn.userID = null;
});

/**
 * AUTH MODEL
 * @type {{createUserAndLogin: Function, signIn: Function, logout: Function, isAuthenticated: Function}}
 */

var Auth = module.exports = {

  /**
   * This is called from the signup.js controller
   * @param email
   * @param password
   * @param cb
   * @returns {userData}
   */

  createUserAndLogin: function(email, password, cb) {
    return ref.createUser({
      email: email,
      password: password
    }, function(error, userData) {
      if (error) {
        //Toastr is a nice flash messaging plugin
        toastr["error"](error);
      } else {
        LoggedIn.userID = userData.uid;
        //This now calls the login method below so the new user is logged in
        Auth.signIn(email, password, cb);
        var users = ref.child("users").child(userData.uid);
        var userProfile = {
          email: email,
          searches: []
        };
        users.set(userProfile)
      }
    })
  },

  /**
   * This is called from the signinBos.js controller
   * @param email
   * @param password
   * @param cb
   * @returns {userID}
   */

  signIn: function(cb) {
    var loggedIn = null;
    return ref.authWithOAuthPopup("facebook", function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
        cb(null, error, null);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        LoggedIn.userID = authData.uid;
        cb(LoggedIn.userID, error, authData.uid);
      }
    }, {
      remember: "sessionOnly"
    });
  },

  logout: function() {
    LoggedIn.userID = null;
    return ref.unauth();
  },

  /**
   * probably a better way a safer way check if a user is logged in anywhere than the getUser method above
   * this is called from several places, such as when getting data in Searches.js to check the user
   * @returns {uid}
   */

  isAuthenticated: function() {
    var authData = ref.getAuth();
    if (authData) {
      console.log("User " + authData.uid + " is logged in with " + authData.provider);
      LoggedIn.userID = authData.uid;
      return authData.uid;
    } else {
      console.log("User is logged out");
      return false;
    }
  }
};
