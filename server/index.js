const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const proxy = require('express-http-proxy');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const next = require('next');
const routes = require('../lib/routes');
const auth = require('./auth');

// Load environment variables from .env file if present
require('dotenv').load();

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const secretKey = process.env.SECRET_KEY || 'secret';

// Next app creation
const app = next({ dev });
// @ts-ignore
const handler = routes.getRequestHandler(app);

// Express app creation
const server = express();
const store =
  !dev &&
  new MongoDBStore(
    {
      uri: process.env.MONGODB_URI,
      collection: 'userSessions',
      connectionOptions: {
        reconnectTries: 160,
        reconnectInterval: 3000,
        socketOptions: {
          keepAlive: true,
          autoReconnect: true,
          connectTimeoutMS: 480000
        }
      }
    },
    error => {
      if (error) {
        console.error('An error occurred connecting with MongoDB:');
        console.error(error);
        process.exit(1);
      }
    }
  );

server.use(
  '/backend',
  proxy(process.env.BACKEND_API_URL, {
    limit: '50mb'
  })
);
server.use(cookieParser(secretKey));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(
  session({
    // 1 day
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 31 },
    resave: true,
    saveUninitialized: true,
    store,
    secret: secretKey
  })
);

server.use('/_next', express.static(path.join(__dirname, '.next/static')));

// Authentication
auth.register();
auth.initialize(server);

// Initializing next app before express server
app
  .prepare()
  .then(() => {
    server.post('/signin', auth.signin);
    server.get('/logout', auth.logout);

    // Redirect the old Discover URLs to the new Explore ones
    server.get('/discover', (req, res) => res.redirect('/explore'));
    server.get('/discover/:projectId/:projectSlug', (req, res) =>
      res.redirect(`/explore/${req.params.projectId}/${req.params.projectSlug}`)
    );

    server.use(handler);

    server
      .listen(port, err => {
        if (err) throw err;
        console.info(`> Ready on http://localhost:${port} [${dev}]`);
      })
      .setTimeout(0);
  })
  .catch(err => {
    console.error('An error occurred, unable to start the server');
    console.error(err);
  });
