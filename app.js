var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const cors = require('cors');

var dotenv = require('dotenv');
dotenv.config();

var session= require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var kategoriRouter = require('./routes/kategori');
var produkRouter = require('./routes/produk');
var registrasiRouter = require('./routes/auth/register');
var loginRouter = require('./routes/auth/login');
var app = express();
const { onlyDomain } = require('./config/middleware/corsOptions');

app.use(cors(onlyDomain));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public/images')))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {
    maxAge: 6000
  },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}))
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/API/kategori', kategoriRouter);
app.use('/API/produk', produkRouter);
app.use('/API/register', registrasiRouter);
app.use('/API/login', loginRouter);

// Tambahkan route untuk halaman login dan register
app.use('/login', loginRouter);
app.use('/register', registrasiRouter);

//up
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
