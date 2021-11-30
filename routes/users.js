//user route module
const express = require("express");
const router = express.Router();

//require controller module
const user_controller = require('../controllers/userController');

// USER ROUTES //

router.get('/applications', user_controller.applications_get);

router.get('/signup', user_controller.signup_get);

router.post('/signup', user_controller.signup_post);

router.get('/:id', user_controller.detail_get);

router.get('/:id/delete', user_controller.detail_delete_get);
module.exports = router;