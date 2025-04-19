"use strict";

const router = require('express').Router();
const DashboardController = require('../controllers/DashboardController');


console.log("Estoy en dashboard - ofter index router")


router.get('/', DashboardController.home);

router.get('/dashboard', DashboardController.homes);



module.exports = router;


