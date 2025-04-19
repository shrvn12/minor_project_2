"use strict";
// Export object literal with all controller actions.
module.exports = {

// Adding route actions to my home controller
  index: (req, res) => {
    res.render("index",{currentUser});},
    
	contact: (req, res) => {
		res.render("contact");
	}};

