var m = require('mithril');
var Auth = require('../models/Auth');

var header = module.exports = {};

header.controller = function (options) {
  ctrl = this;
  //ctrl.error = m.prop(null);

  ctrl.loginUser = function(e) {
    e.preventDefault();
      Auth.signIn(function( user, error, uid ) {
        if (user) {
          toastr["success"]("You are logged in!");
          //console.log("User: " + uid);
          m.redraw();
        }
        else if (error) {
          toastr["error"](error);
          //ctrl.error(error);
        } else {
          console.log("Log in failed");
        }
      });
  };

  ctrl.logout = function(){
    Auth.logout();
    toastr["warning"]("You are logged out");
  };
};

/**
 * The header view changes depending on the returned value for the global checkUser method
 * The config m.route for links ensures the whole page is not refreshed when link is clicked
 * @param ctrl
 * @param options
 * @returns {*}
 */


header.view = function (ctrl, options) {
  return m('.navbar.navbar-default', [
      checkViewState(ctrl)
    ]); //end navbar
};

function checkViewState(ctrl){
  return window.checkUser() ? renderLoggedInView(ctrl) : renderLoggedOutView(ctrl);
}

function renderLoggedOutView(ctrl){
  return m('.container-fluid',
      [m('.navbar-header',
        [m('a.navbar-brand[href="/"]', "Livability", {config: m.route})
         ]),
        m('div',
          [m('ul.nav.navbar-nav',
            [m('li',[ m('a[href="/about"]', {config: m.route},  "About")]),
            ])
          ]),  //end div wrapping ul
        m('form.navbar-form.navbar-right', {onsubmit: ctrl.loginUser},
          [
          m('input.btn.btn-primary.navbar-login.login-btn[type="submit"][value="Log in with Facebook"]')
        ]) //end of form
      ]) //end container
};

var renderLoggedInView = function(ctrl){
  return m('.container-fluid',
      [m('.navbar-header',
        [m('a.navbar-brand[href="/"]', {config: m.route}, "Livability")
      ]),
      m('div',
        [m('ul.nav.navbar-nav',
          [m('li',[ m('a[href=/searches/' + window.checkUser() + ']', {config: m.route}, "Previous" +
            " Searches")])
          ])
        ]),
      m('.div',
        [m('.navbar-right', [
          m('button.btn.btn-default.logout-btn', {onclick: ctrl.logout}, "Log out")]),
        ])
      ]) //end container
};
