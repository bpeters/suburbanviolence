var express = require('express');
var app = express();
var path = require('path');
var swig  = require('swig');
var routes = require('./routes');
var user = require('./user');
var passport = require('passport');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var config = require('config');
var sessionSecret = process.env.SESSION_SECRET || config.get('Session.secret');

app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/game')));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(cookieParser());
app.use(session({
	secret: sessionSecret,
	saveUninitialized: true,
	resave: true,
	cookie : {
		maxAge: 3600000
	},
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//public routes
app.get('/', routes.index);

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listening on " + port);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		console.log(err);
		res.status(err.status || 500);
		res.send({
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send({
		message: err.message,
		error: {}
	});
});
