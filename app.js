var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session=require('express-session');
var FileStore=require('session-file-store')(session);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');




var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('01-001-0001-00001'));
app.use(session({
  name:'session-id',
  secret:'01-001-0001-00001',
  saveUninitialized:false,
  resave:false,
  store:new FileStore()
}));
//authentication :basic
function auth (req, res, next) {
  //console.log(req.signedCookies);
  console.log(req.session);

  //req.signedCookies.user
  if(!req.session.user){
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        next(err);
        return;
    }

    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    
    var user = auth[0];
    var pass = auth[1];

    if (user == 'admin' && pass == 'password') {
      //res.cookie('user','admin',{signed:true})  
      req.session.user='admin';
      next(); // authorized
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');      
        err.status = 401;
        next(err);
    }
  }
  else{
    if(req.session.user==='admin'){
      next();
    }
    else{
      var err = new Error('You are not authenticated!');
           
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);
//end of auth

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

//mongodb server connection
//"C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe" --dbpath=data --for cmd admin to start mongo db locally
const mongoose = require('mongoose');

const Dishes = require('./models/dishes');
const { use } = require('./routes/index');

const url = 'mongodb://localhost:27017/conFusion';
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
