//server domain and port to use during communications
var servername = 'ttl128.herokuapp.com';
var serverport = 3000;

//number of seconds of life of each message
var ttl_in_seconds = 128*60;
var seconds_to_add = 60;
var seconds_to_sub = 60;

//incremental counter for the messages
var mssg_counter = 0;

//array of messages. will contain json objects with the form
//{"id": "jj", username": "xxx", "message": "yyy", "timereamining": "zzz"}
var messages = new Array();

//node.js modules required
var http = require('http');
var util = require('util');
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var passport = require('passport');
var google_strategy = require('passport-google').Strategy;
var sanitizer = require('sanitizer');

//starting a new http server based on express framework
var app = express();
var server = http.createServer(app);

// PASSPORT NEEDED FUNCTIONS AND SETTINGS
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
passport.use(new google_strategy({
    returnURL: 'http://' + servername + '/auth/google/return',
    realm: 'http://' + servername + '/'
  }, function (identifier, profile, done) {
     process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// EXPRESS FUNCTIONS AND SETTINGS (SOME OF THEM NECCESARIES FOR PASSPORT TO WORK)
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser("thissecretrocks"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(stylus.middleware({src: __dirname + '/public', compile: compile}));
  app.use(express.static(__dirname + '/public'));
});


// DEFINITION OF ROUTES
app.get('/', ensureAuthenticated, function (req, res) {
  res.render('index', { user: req.user });
});
app.get('/login', function (req, res) {
  res.render('login');
});
app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
app.get('/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


// STARTS THE HTTP LISTEN PROCESS AND STABLISH THE LONG POLLING
var io = require('socket.io').listen(app.listen(process.env.PORT || serverport));
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

// NEW CLIENT CONNECTED
io.sockets.on('connection', function (socket) {

  // when a new client is detected, we send to him all the stored messages
  messages.forEach(function (element, index, array) {
    socket.emit('message in', element);
  });
  
  // mssg received
  socket.on('message out', function (new_ttl_mssg) {
    var sanitized_mssg = sanitizer.escape(new_ttl_mssg.message);
    if (sanitized_mssg.length > 0 && sanitized_mssg.length < 128) {
      var new_json_mssg = JSON.parse('{ \
        "id": "ttl-' + (mssg_counter++) + '", \
        "username": "' + new_ttl_mssg.username + '", \
        "message": "' + sanitized_mssg + '", \
        "timeremaining": "' + ttl_in_seconds + '" \
      }');
      messages.push(new_json_mssg);
      io.sockets.emit('message in', new_json_mssg); //sending the message to all sockets, includying the one who send it
    }
  });

  socket.on('message up', function (ttl_mssg_id) {
    for (var i = 0; i < messages.length - 1; i++) {
      if (messages[i].id == ttl_mssg_id) {
        messages[i].timeremaining += seconds_to_add;
        io.sockets.emit('message up', messages[i]);
        break;
      }
    }
  });
  //messages.sort(function (a, b) { return a.timeremaining - b.timeremaining; });

});

//creates the timing to delete died messages
setInterval(function () {
  messages.forEach(function (element, index, array) {
    element.timeremaining -= 1;
    if (element.timeremaining <= 0) {
      io.sockets.emit('message to delete', element.id);
      messages.splice(index, 1);
    }
  });
}, 1000);