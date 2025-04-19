"use strict";

const 
 // use the Router module in Express.js
  router = require("express").Router(),
  usersController = require("../controllers/usersController"),
  UserController = require("../controllers/UserController");


// route adminControl - header view - menu option Admin Control
router.get("/adminControl", usersController.adminControlGET);

// route checkAdmin  - menu option Admin Control - adminControl view
router.post("/checkAdmin", usersController.adminControlPOST);

// route createUser  - menu option Admin Control - adminDashboard - option create User view
router.get("/createUser", usersController.adminControlCreateUserGET);


// route createUser  - menu option Admin Control - adminDashboard - option create User view
router.post("/createUserPost", usersController.adminControlCreateUserPOST);

// route login  - menu option login - dashboard/index0 view
router.get("/login", usersController.loginGET);

// route login  - menu option login - dashboard/index0 view
router.post("/login", usersController.loginPOST);

router.get("/logout", usersController.logout);


//router.get("/edit", UserController.edit)
router.get("/:id/edit", UserController.edit);

router.put("/:id/update", UserController.update);

/*
// Process data from the edit form, and display the user show page.
router.get("/:id/edit", usersController.edit);
router.put("/:id/update", usersController.update, usersController.redirectView);
// This show route uses the /users path along with an :id parameter. This parameter 
// will be filled with the user’s ID passing in from the index page when you click the 
// user’s name in the table
router.get("/:id", usersController.show, usersController.showView);
// This route handles DELETE requests that match the path users/ plus the user’s ID plus /delete.
// Then the route redirects to your specified redirect path when the record is deleted.
router.delete("/:id/delete", usersController.delete, usersController.redirectView);*/

module.exports = router;
