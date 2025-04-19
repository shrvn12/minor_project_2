const router = require('express').Router();
const UserController = require('../controllers/UserController');

router.post('/', UserController.create);
router.get('/:page', UserController.read);
router.get('/', UserController.read);


router.get("/:id/edit", UserController.edit);



//router.patch('/:id', UserController.update);

router.put("/:id/update", UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
