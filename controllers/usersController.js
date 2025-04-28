"use strict";


const 
bcrypt = require('bcryptjs'),
User = require('../models/user'),
{
  RegisterValidator,
  LoginValidator,
 
} = require('../middlewares/Validator'),

UserController = {};


const { body } = require("express-validator/check");

const 
  
  passport = require("passport"),
  // This function is reused throughout the controller to organize user attributes 
  // in one object. You should create the same functions for your other model controllers.
  getUserParams = body => {
    return {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role
    };
  };
// Export object literal with all controller actions.
module.exports = {
  index: (req, res, next) => {
    User.find()
      .then(users => {
         // Send saved data to the next then code block.
         // Store the user data on the response and call the next middleware function.
        res.locals.users = users;
        next();
      })
      // Log error messages and redirect to the home page.
      .catch(error => {
        console.log(`Error fetching users: ${error.message}`);
        next(error);
      });
  },
// action adminControl - header view - menu option Admin Control

adminControlGET: (req, res) => { 


  //res.render("users/AdminForm",{currentUser});
  res.render("users/AdminForm");
  return;
  res.end();
},

  // action checkAdmin  - menu option Admin Control - adminControl view

  adminControlPOST: (req, res) => { 
  
            console.log("req.body.AdminName: "+ req.body.AdminName);
            console.log("res.locals.AdminName: "+res.locals.AdminName);
            console.log("req.body.AdminPassword : "+ req.body.AdminPassword );
            console.log("res.locals.AdminPassword: "+res.locals.AdminPassword);
    


     if (req.body.AdminName == res.locals.AdminName & req.body.AdminPassword == res.locals.AdminPassword)
     {   
           let adminPassword = res.locals.AdminPassword;
           let AdminPassword = req.body.AdminPassword;
           console.log("estoy en adminControlPOST y voy hacia dashboard/index0");

           res.render("dashboard/index0",{adminPassword,AdminPassword});
           return;
           res.end()

        } else {

          res.render("users/AdminForm");
          return;
          res.end();

        }
},


adminControlCreateUserGET: (req, res) => {

  res.render("users/_collect-form");
  return;
  res.end();

},


// action createUser  - menu option Admin Control - adminDashboard - option create User view
adminControlCreateUserPOST: (req, res) => { 

   console.log("Estoy en adminControlCreateUserPOST ....")
   const { name, email, password, role, address } = req.body;
   const validator = RegisterValidator({
    name,
    email,
    password,
    role,
    address
   });
  
 
  
   if (validator.error) {

    console.log ("Estoy en adminControlCreateUserGET, y validator.error: "+ validator.error)
    req.flash('error', validator.error);
    return res.redirect('/checkAdmin');
   }

   console.log("Estoy en adminControlCreateUserPOST, email: "+ req.body.email)
   console.log("Estoy en adminControlCreateUserPOST, validator.value.email: "+ validator.value.email)

   User.findOne({ email: validator.value.email })
   .then((userExists)=>{
 
    console.log("Result - linea 124 :",userExists);
    
    if (userExists!=null) {
      req.flash('error', 'User already exist with this email account.');
      console.log("Estoy en adminControlCreateUserPOST, userExists - line 125 voy a createUser ")
      return res.redirect('/createUser');

    }

    console.log ("Estoy en adminControlCreateUserGET, y paso userEXists ")

    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        User.create({
          "name": validator.value.name,
          "email": validator.value.email,
        "password": hash,
         "role": req.body.role,
          "address": req.body.address
      }, function (error2, data) {
        if (error2) {
          console.log(error2);
          return;
        }
  
        //res.render("/createUser", {});

        req.flash(
          'success',
          `New user (${validator.value.email}) has been created successfully!`
        );
        return res.redirect('/createUser');


      });
      }) })
  

    })},

  // Action login GET  - menu option login - dashboard/index0 view

  loginGET: (req, res) => {
   
    res.render("login");
    return;
    res.end();

  },

 





  // action login  - menu option login - dashboard/index0 view
  loginPOST: async (req, res) => {

    console.log("Estoy en loginGet ...")

    const { email, password } = req.body;
    const validator = LoginValidator({ email, password });

    console.log ("validator.error - line 197 : "+ validator.error);

    if (validator.error) {
      req.flash('error', validator.error);
      return res.redirect('login');
    }
    console.log ("validator.error - line 197 : "+ validator.error);

    const user = await User.findOne({ email: validator.value.email });
    
    console.log ("user - line 196 : "+ user);


    if (!user) {
      req.flash('error', "User doesn't exist with this email account.");
      return res.redirect('login');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      req.flash('error', 'Invalid Password!');
      return res.redirect('login');
    }
  
    console.group("Voy hacia dashboard .. line 212, paso todos los if ant.")

    req.session.user = user;
    //res.locals.user = req.session.user;
    
    

    console.log("Estoy en userController - line 219 - req.session.user:" + req.session.user )
    console.log("Estoy en userController - line 220 - currentUser:" + res.locals.currentUser )
    
    
     req.session.save();
    
     console.log("Estoy en userController - line 225 - req.session:" + req.session );
     res.locals.currentUser = true;
     
     
     
        res.redirect('/dashboard'); // calls dashboard route
      // res.render ("dashboard/index",{currentUser})

  },






  // redirect login action to get into system

  redirectloginPOST: (req, res) => {

    res.locals.currentUser = req.session.user;
    res.render('dashboard/index');
  },

 // log out action in main menu
  logout:
  (req, res, next)=>{
  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      req.flash("success", "You have been logged out!");
      res.redirect('/')
    })
  })
},



/*logout:
  (req, res)=>{
    
    req.flash('success', 'You have been logged out!');
    req.session.destroy(function () {
    
      
      res.redirect('/');
    });

},*/





// create action from users - dashboard - view
create : async (req, res) => {
  const { name, email, password, role, address } = req.body;
  const validator = RegisterValidator({
    name,
    email,
    password,
    role,
    address
  });
  if (validator.error) {
    req.flash('error', validator.error);
    return res.redirect('/users');
  }
  const userExists = await User.findOne({ email: validator.value.email });
  if (userExists) {
    req.flash('error', 'User already exist with this email account.');
    return res.redirect('/users');
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    name: validator.value.name,
    email: validator.value.email,
    password: hashedPassword,
    role,
    address
  });
  try {
    const savedUser = await newUser.save();
    req.flash(
      'success',
      `New user (${savedUser.email}) has been created successfully!`
    );
    return res.redirect('/users');
  } catch (error) {
    req.flash('error', 'User already exist with this email account.');
    return res.redirect('/users');
  }
},

// read action 
read : async (req, res) => {
  const perPage = 30;
  const page = req.params.page || 1;
  const users = await User.find({})
    .skip(perPage * page - perPage)
    .limit(perPage);
  const count = await User.countDocuments();
  res.render('users/index', {
    currentUser,
    users,
    current: page,
    pages: Math.ceil(count / perPage),
  });
},

// update action 

update : async (req, res) => {
  const { name, password, role } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      name,
      password: hashedPassword,
      role,
    },
  });
  req.flash('success', `User (${user.email}) has been updated successfully!`);
  res.redirect('/users');
},

// delete action
delete : async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  req.flash('success', `User (${user.email}) has been deleted successfully!`);
  res.redirect('/users');
},



// API get user action
getUser : async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      return res.send({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
    return res.send("User Doesn't Exist");
  } catch (e) {
    return '';
  }
},

};

