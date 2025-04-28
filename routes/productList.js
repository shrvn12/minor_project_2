const router = require('express').Router();
const productListController = require('../controllers/productListController');

router.get('/', productListController.read);

module.exports = router;
