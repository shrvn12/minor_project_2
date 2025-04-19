"use strict";

require('dotenv').config();

const 
// require express module
express = require("express"),
// The express webserver application is instantiated and stored
// in a constant to be referred to as app
app = express(),



// Route paths, in combination with a request method, define the endpoints at which 
// requests can be made. Route paths can be strings, string patterns, or regular 
// expressions.
path = require('path'),

  // let Express.js know to use this package as an additional middleware layer by 
  // adding app.use(layouts)
  layouts = require("express-ejs-layouts"),
  mongoose = require("mongoose"),


  PermissionHandler = require('./middlewares/PermissionHandler'),


  // CORS stands for Cross-Origin Resource Sharing. It allows us to relax the security applied to an API. This is done by bypassing the Access-Control-Allow-Origin headers, which specify which origins can access the API.
  //In other words, CORS is a browser security feature that restricts cross-origin HTTP requests 
// with other servers and specifies which domains access your resources.

  cors = require('cors'),

  ruta = require('./routes/index'),

  // method-override is middleware that interprets requests according to a specific query 
  // parameter and HTTP method. With the _method=PUT query parameter, you can interpret 
  // POST requests as PUT requests
  methodOverride = require("method-override"),

  // You need the express-session module to pass messages between your application and
  // the client. These messages persist on the user’s browser but are ultimately 
  // stored in the server.
  session = require("express-session"),
  // you need the cookie-parser package to indicate that you want to use cookies and 
  // that you want your sessions to be able to parse (or decode) cookie data sent back
  // to the server from the browser.
  // You tell your Express.js application to use cookie-parser as middleware and to use 
  // some secret passcode you choose. cookie-parser uses this code to encrypt your data 
  // in cookies sent to the browser.
  cookieParser = require("cookie-parser"),
  // Use the connect-flash package to create your flash messages. This package is 
  // dependent on sessions and cookies to pass flash messages between requests.
  flash = require('connect-flash'),

  MongoStore = require('connect-mongo')(session),

  expressValidator = require("express-validator"),
// Require the passport module, Passport.js uses methods called strategies for
//users to log in. The local strategy refers to the username and password login 
// method.
  passport = require("passport"),
  // require controllers
  //errorController = require("./controllers/errorController"),
 // homeController = require("./controllers/homeController"),
  //subscribersController = require("./controllers/subscribersController"),
  //usersController = require("./controllers/usersController"),
  //coursesController = require("./controllers/coursesController"),
  User = require("./models/user");

// Mongoose will support my promise chains  
mongoose.Promise = global.Promise;
// Add Mongoose connection to Express.js
mongoose.connect(
// Set up the connection to your database.  
 "mongodb://shravan:shravan@ac-ndrrxin-shard-00-00.rirtsdj.mongodb.net:27017,ac-ndrrxin-shard-00-01.rirtsdj.mongodb.net:27017,ac-ndrrxin-shard-00-02.rirtsdj.mongodb.net:27017/minor_project?ssl=true&replicaSet=atlas-13kcqd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0",

 
  {// useNewUrlParser: true , // not longer neccesary
	// useFindAndModify: false } // not longer neccesary
  });
//mongoose.set("useCreateIndex", true); // not longer neccesary
// Assign the database to the db variable.
const db = mongoose.connection;

// Log a message when the application connects to the database.
db.once("open", () => {
  console.log("Successfully connected to MongoDB using Mongoose!");
});

// set uyp the aplication to listen on port 3000
app.set("port", process.env.PORT || 3000);
// This line tells your Express.js application to set its view engine as ejs
app.set("view engine", "ejs");


// enable the serving of static files include your assets and custom error pages, 
// such as 404.html and 500.html
// tells your application to use the corresponding public folder, at
// the same level in the project directory
app.use(express.static("public"));
// Enable EJS layout rendering
// Set the application to use the layout module.
 //app.use(layouts);
// Capturing posted data from the request body
// analyze incoming request bodies use of req.body
// To easily parse the body of a request, you need the help of the express.json and
// express.urlencoded middleware function. These modules act as middleware between 
// your request being received and processed fully with Express.js.
app.use(express.urlencoded({extended: false}));
// analyze incoming request bodies use of req.body
// specify that you want to parse incoming requests that are URL-encoded 
// (usually, form post and utf-8 content) and in JSON format
app.use(express.json());
// Tell the application to use methodOverride as middleware
// method-override is middleware that interprets requests according to a specific query
// parameter and HTTP method. With the _method=PUT query parameter, you can interpret
// POST requests as PUT requests

app.use(methodOverride("_method", { methods: ["POST", "GET"]}));

//you have your application use sessions by telling express-session to use cookie-parser 
// as its storage method and to expire cookies after about an hour.
app.use(cookieParser("secret_passcode"));

app.use(session({
    secret: "secret_passcode", // You also need to provide a secret key to encrypt your session data.
    cookie: {
      maxAge: 4000000},
    resave: false, // Also specify that you don’t want to update existing session
                   // data on the server if nothing has changed in the existing session
    saveUninitialized: false, // Specify that you don’t want to send a cookie to the 
                             // user if no messages are added to the session
                             store: new MongoStore({
                              mongooseConnection: db,
                              collection: 'session',
                            }),
  })
);


// initialize the passport module and have your Express.js app use it
app.use(passport.initialize());
// Configure passport to use sessions in Express.js.
// passport.session tells passport to use whatever sessions you’ve already set up 
// with your application.
app.use(passport.session());
// set up your login strategy on the user model and tell passport to handle
// the hashing of user data in sessions for you



//passport.use(User.createStrategy());

// Set up passport to serialize and deserialize your user data.
// These lines direct the process of encrypting and decrypting user data stored in sessions.
//passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// have the application use connect-flash as middleware.
app.use(flash());

// you can add messages to req.flash at the controller level and access 
// the messages in the view through flashMessages.
app.use((req, res, next) => {
  res.locals.loggedIn = req.isAuthenticated(); // Set up the loggedIn
                                              // variable to reflect passport login status.
  //res.locals.currentUser = false; // Set up the currentUser to
                                   //reflect a logged-in user.
  res.locals.currentUser = false;
  
  res.locals.AdminName = "admin"; // admin name
  res.locals.AdminPassword = "2301010465"; // clave admin
  res.locals.adminPassword = ""; 
  const successFlashMessageArr = req.flash('success');
  const errorFlashMessageArr = req.flash('error');
  res.locals.successMsg = successFlashMessageArr[0];
  res.locals.errorMsg = errorFlashMessageArr[0];
 

 // Assign flash messages to the local flashMessages variable on the response object. 
  res.locals.flashMessages = req.flash();
  
  next();
});
app.use(expressValidator());

// This code tells your Express.js application to use the router object as 
// a system for middleware and routing.
app.use("/", ruta);

app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
