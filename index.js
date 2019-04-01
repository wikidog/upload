//
// index.js is the Main starting point of the application
//

// load dotenv as early as possible
require('dotenv').config();

// debugging
const debug = require('debug')('upload:main');

// logger
const morgan = require('morgan');
const logger = require('./services/logger');

//
const express = require('express');
const createError = require('http-errors');

const path = require('path');
// const http = require('http');
const bodyParser = require('body-parser');

// const mongoose = require('mongoose');
// const cookieSession = require('cookie-session');
// const passport = require('passport');
const cors = require('cors');

// ---------------------------------------------------------------------
// DB setup
//
// mongoose.Promise = global.Promise;
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log('Database connected...'))
//   .catch(e => console.log('Database connection error: ', e));

// ---------------------------------------------------------------------

// The order of middler is important!!!
//
// Take a look at the following link to see how to configure Passport
// https://github.com/mstade/passport-google-oauth2/blob/master/example/app.js

// Passport configuration first
//
// require('./services/passport');

debug('NODE_ENV: %s', process.env.NODE_ENV);

// configure Express
//
const app = express();

// App Setup
//
// these are middlewares; must be called before our application
//
// morgan: HTTP request logger middleware
//         'combined': standard Apache combined log output
// app.use(morgan('combined'));
// use winston to log morgan's log
app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));
//
// serve static files
// '/' is a virtual path, which is mapped to '/public' folder
app.use('/', express.static(path.join(__dirname, 'public')));

// allow CORS requests
//
app.use(cors());
//
// body-parser: parse request bodies, available under the req.body property
//              json({type: '*/*'}) - parse as JSON for any request
//
// parse "Content-Type: application/json"
app.use(bodyParser.json());
// parse "Content-Type: application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------------------------------------------------------

// for debugging
if (debug.enabled) {
  app.use((req, res, next) => {
    debug('request headers: %O', req.headers);
    next();
  });
}

// App routes
//
require('./routes/upload')(app);

// catch 404 and forward to error handler
//   404 responses are not the result of an error,
//   so the error-handler middleware will not capture them
app.use(function(req, res, next) {
  next(createError(404));
});

// error handling middleware - catch all the errors here
//
app.use((err, req, res, next) => {
  // console.log('*** error handling middleware ***', err);
  logger.error(
    '[Error Handler] %s - %s - %s',
    req.method,
    req.path,
    err.message
  );
  res.status(422).send({ error: 'Unprocessable Entity' });
});

// ---------------------------------------------------------------------

// Server Setup
const port = process.env.PORT || 5000;
app.listen(port, () =>
  logger.info(`Server running at http://localhost:${port}/`)
);
