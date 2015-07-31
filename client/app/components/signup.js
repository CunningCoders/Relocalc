var m = require('mithril');
var Auth = require('../models/Auth');
var signup = module.exports = {};

signup.controller = function (options) {
  ctrl = this;
  ctrl.email = m.prop('');
  ctrl.password = m.prop('');

  ctrl.error = m.prop(null);

  ctrl.signup = function(e) {
    e.preventDefault();
    if (validateInputs(ctrl.email(), ctrl.password())){
      toastr["error"]("That email and password combo is invalid. Try Again.");
      ctrl.warning = {};
      return ctrl.warning.error = "Please enter a valid email address and password";
    } else {
      Auth.createUserAndLogin( ctrl.email(), ctrl.password(), function( success, error ) {
        clearInputs();
        if (success) {
          /**
           * all the toastr flash messages are part of a nifty plug-in which give custom error messages
           * check out their website for more info!
           */
          toastr["success"]("Your Relocalc account is created!");
          m.route("/");
        }
        else if (error) {
          toastr["error"](error);
          ctrl.error(error);
        }
      })
    }
  };

  function clearInputs () {
    ctrl.email('');
    ctrl.password('');
    ctrl.error(null);
    flash = null
  }

  /**
   * Helper function checks that it is valid email and password is at least 6 numbers and letters
   * @param email
   * @param password
   * @returns {boolean}
   */

  function validateInputs (email, password) {
    var emailMatch = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var passMatch = /^[0-9a-zA-Z]{6,}$/;
    return !emailMatch.test(email) || !passMatch.test(password);
  }

};

signup.view = function (ctrl, options) {
  return m('.container',
      [m('.row.signup-container',
          [m('.col-sm-6.col-sm-offset-3',
            [m('.panel.panel-default',
                [m('.panel-heading.text-center',
                    [m('h3', "Signup")]),
                 m('.panel-body',
                    [m('form', errorView(ctrl), signUpForm())])
                ])
            ])
          ])
      ])
};

function signUpForm() {
  return [
    m('.form-group', [
      m('input.form-control.input-lg[placeholder="joe.montana@49ers.com"]', {
        value: ctrl.email(),
        onchange: m.withAttr('value', ctrl.email)
      })]),
    m('.form-group', [
      m('input.form-control.input-lg[placeholder="At least 6 letters and/or numbers"]', {
        value: ctrl.password(),
        onchange: m.withAttr('value', ctrl.password)
      })]),
    m('input.btn.btn-default.btn-lg.pull-right.signup-btn[type="submit"][value="Signup"]', {onclick: ctrl.signup}),
  ]
}

// this is really extra as the flash toastr flash messages already do the job

function errorView(ctrl) {
  var errorObj = ctrl.error() || ctrl.warning;
  var flash = ctrl.getFlash();

  return [
    errorObj  ?  m('.alert.alert-danger', [
      m('p', errorObj.error ),
      m('p', errorObj.reason)
    ]) : null
  ]
}
