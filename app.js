var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var passport = require('passport');
var authenticate = require('./authenticate');

var session=require('express-session');
var FileStore=require('session-file-store')(session);

var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const favoriteRouter=require('./routes/favoriteRouter');
//for authentication

//file upload

const uploadRouter = require('./routes/uploadRouter');


var app = express();


// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('01-001-0001-00001'));


app.use(passport.initialize());

//file upload
app.use('/imageUpload',uploadRouter);

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

app.use('/favorites',favoriteRouter);

//mongodb server connection
//"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath=data --for cmd admin to start mongo db locally
//"C:\Program Files\MongoDB\Server\4.2\bin\mongo.exe"
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const { use } = require('./routes/index');

const url = config.mongoUrl;
const connect = mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true  });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
