import * as express from 'express';

//server domain and port to use during communications
const SERVER_NAME = 'ttl128.herokuapp.com';
const SERVER_PORT = 3000;

//number of seconds of life of each message
const TTL_IN_SECONDS = 128 * 60;
const SECONDS_TO_ADD = 60;
// const secondsToSub = 60;

//incremental counter for the messages
let msgCounter = 0;

/**
 * Express configuration
 */
const session = require('express-session');
const app = express();

app.use(express.static(__dirname + '/public'));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'th1s_1s_n0t_s0_s3cr3t',
  }),
);

app.get('/login', (_, res) => res.render('login'));

const stylus = require('stylus');
const nib = require('nib');
app.set('view engine', 'pug');

const compile = (str: string, path: string) => {
  return stylus(str).set('filename', path).use(nib());
};

app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));

app.listen(SERVER_PORT, () =>
  console.log(`TTL128 up and running on port ${SERVER_PORT}!`),
);

// const passport = require('passport');

// // const http = require('http');
// // const util = require('util');

// // const google_strategy = require('passport-google').Strategy;
// const sanitizer = require('sanitizer');

// //array of messages. will contain json objects with the form
// //{"id": "jj", username": "xxx", "message": "yyy", "timeRemaining": "zzz"}
// const messages = [];

// //starting a new http server based on express framework
// const server = http.createServer(app);

// // PASSPORT NEEDED FUNCTIONS AND SETTINGS
// passport.serializeUser(function (user, done) {
//   done(null, user);
// });
// passport.deserializeUser(function (obj, done) {
//   done(null, obj);
// });
// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// }
// passport.use(
//   new google_strategy(
//     {
//       returnURL: 'http://' + SERVER_NAME + '/auth/google/return',
//       realm: 'http://' + SERVER_NAME + '/',
//     },
//     function (identifier, profile, done) {
//       process.nextTick(function () {
//         profile.identifier = identifier;
//         return done(null, profile);
//       });
//     },
//   ),
// );

// // EXPRESS FUNCTIONS AND SETTINGS (SOME OF THEM NECESSARIES FOR PASSPORT TO WORK)

// app.set('views', __dirname + '/views');
// app.set('view engine', 'pug');
// // app.use(express.cookieParser('th1s_1s_n0t_s0_s3cr3t'));
// // app.use(express.bodyParser());
// // app.use(express.methodOverride());
// // app.use(express.session({ secret: 'keyboard cat' }));
// app.use(passport.initialize());
// app.use(passport.session());
// // app.use(app.router);

// // DEFINITION OF ROUTES
// app.get('/', ensureAuthenticated, function (req, res) {
//   res.render('index', { user: req.user });
// });
// app.get('/login', function (req, res) {
//   res.render('login');
// });
// app.get(
//   '/auth/google',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function (req, res) {
//     res.redirect('/');
//   },
// );
// app.get(
//   '/auth/google/return',
//   passport.authenticate('google', { failureRedirect: '/login' }),
//   function (req, res) {
//     res.redirect('/');
//   },
// );
// app.get('/logout', function (req, res) {
//   req.logout();
//   res.redirect('/');
// });

// // STARTS THE HTTP LISTENING PROCESS AND STABLISH THE LONG POLLING
// const io = require('socket.io').listen(
//   app.listen(process.env.PORT || SERVER_PORT),
// );
// io.configure(function () {
//   io.set('transports', ['xhr-polling']);
//   io.set('polling duration', 10);
// });

// // NEW CLIENT CONNECTED
// io.sockets.on('connection', function (socket) {
//   // when a new client is detected, we send to him all the stored messages
//   messages.forEach(function (element, index, array) {
//     socket.emit('message in', element);
//   });

//   // msg received
//   socket.on('message out', function (newTtlMsg) {
//     const sanitizedMsg = sanitizer.escape(newTtlMsg.message);
//     if (sanitizedMsg.length > 0 && sanitizedMsg.length < 128) {
//       const newJsonMsg = JSON.parse(
//         '{ \
//         "id": "ttl-' +
//           msgCounter++ +
//           '", \
//         "username": "' +
//           newTtlMsg.username +
//           '", \
//         "message": "' +
//           sanitizedMsg +
//           '", \
//         "timeRemaining": "' +
//           TTL_IN_SECONDS +
//           '" \
//       }',
//       );
//       messages.push(newJsonMsg);
//       io.sockets.emit('message in', newJsonMsg); //sending the message to all sockets, including the one who send it
//     }
//   });

//   socket.on('message up', function (ttlMsgId) {
//     for (const i = 0; i < messages.length - 1; i++) {
//       if (messages[i].id == ttlMsgId) {
//         messages[i].timeRemaining += SECONDS_TO_ADD;
//         io.sockets.emit('message up', messages[i]);
//         break;
//       }
//     }
//   });
//   //messages.sort(function (a, b) { return a.timeRemaining - b.timeRemaining; });
// });

// //creates the timing to delete died messages
// setInterval(function () {
//   messages.forEach(function (element, index, array) {
//     element.timeRemaining -= 1;
//     if (element.timeRemaining <= 0) {
//       io.sockets.emit('message to delete', element.id);
//       messages.splice(index, 1);
//     }
//   });
// }, 1000);
