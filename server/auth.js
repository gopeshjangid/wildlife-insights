const axios = require('axios');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const URI = require('urijs');

const register = () => {
  passport.use(
    'local-signin',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: true,
        passReqToCallback: true
      },
      (req, email, password, done) => {
        // 'passport-local' only accepts username and password in its options. for any
        // additional parameter (like for authentication with token) utilizing
        // "passReqToCallback" to access "req" object

        if (req.body.authToken) {
          // this is for token-based authentication. before persisting the token in
          // session, validating it with getUserDetails api call
          const meAPIUrl = new URI(process.env.BACKEND_API_URL).pathname(
            '/v1/auth/me'
          );

          axios
            .default({
              url: meAPIUrl.href(),
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${req.body.authToken}`
              }
            })
            .then(() =>
              done(null, {
                token: req.body.authToken,
                refreshToken: req.body.refreshToken,
                email: req.body.userEmail
              })
            )
            .catch(({ response }) => {
              return done(response);
            });
        } else {
          // for normal authentication - with username and password
          const loginAPIUrl = new URI(process.env.BACKEND_API_URL).pathname(
            '/v1/auth/sign-in'
          );
          axios
            .default({
              url: loginAPIUrl.href(),
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              data: { email, password }
            })
            .then(({ data }) => {
              return done(null, { ...data, email });
            })
            .catch(({ response }) => done(response));
        }
      }
    )
  );

  // Passport session setup.
  // To support persistent login sessions, Passport needs to be able to
  // serialize users into and deserialize users out of the session.
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

const initialize = server => {
  if (!server)
    throw new Error(
      'Server params is required. It should be a instance of Express.'
    );
  server.use(passport.initialize());
  server.use(passport.session());
};

const signin = (req, res, done) =>
  passport.authenticate('local-signin', (err, user) => {
    if (err) {
      let errorMsg = 'Invalid Login';
      let authType = 'withCredentials';
      if (typeof req.body === 'object' && req.body.authToken) {
        authType = 'withToken';
      }
      if (typeof err === 'object') {
        try {
          errorMsg = err.data.errors[0].title;
        } catch (e) {
          if (err.data) {
            errorMsg = err.data;
          }
        }
      }
      return res
        .status(401)
        .json({ status: 'error', message: errorMsg, authType });
    }
    if (!user) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid Login' });
    }
    return req.login(user, {}, loginError => {
      if (loginError) {
        return res.status(401).json({ status: 'error', message: loginError });
      }
      return res.json(req.user);
    });
  })(req, res, done);

const logout = (req, res) => {
  req.session.destroy();
  req.logout();
  res.redirect('back');
};

module.exports = { register, initialize, signin, logout };
