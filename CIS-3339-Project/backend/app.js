// This is the main file for the backend

// import functionalities
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const cors = require('cors');
// allow using a .env file
require('dotenv').config(); //require the dotenv

// creates a new instance of express application
const app = express();

// add cors header to the server
// S1: Locked down to CORS_ORIGIN instead of '*'
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
);

// suppress mongoose warning to prepare for new version
mongoose.set('strictQuery', false);

// sets up mongoose for the mongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Database connection Success!');
  })
  .catch((err) => {
    console.error('Mongo Connection Error', err);
  });

// declare port number for the api
const PORT = process.env.PORT || 3000;

// setup and access request body
app.use(express.json());
app.use(morgan('dev'));

// B2: Health check endpoint (publicly accessible)
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected'
  });
});

// setup middle ware for routes
app.use('/clients', require('./routes/clients'));
app.use('/events', require('./routes/events'));
app.use('/org', require('./routes/org'));
app.use('/services', require('./routes/services'));
app.use('/users', require('./routes/users'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// error handler
app.use(function (err, req, res, next) {
  // logs error and error code to console
  console.error(err.message, req);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  // B2: Must return the required JSON shape { "error": "Human readable message" }
  res.status(err.statusCode).json({ error: err.message });
});
