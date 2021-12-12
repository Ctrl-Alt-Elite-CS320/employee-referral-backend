//user route module
const express = require("express");
const router = express.Router();

//require controller module
const user_controller = require('../controllers/userController');

// USER ROUTES //

router.get('/applications', user_controller.applications_get);

router.get('/signup', user_controller.signup_get);

router.post('/signup', user_controller.signup_post);

//get details of user from empId param and compId in body
router.get('/:empId', user_controller.detail_get);

//delete certain user by passing in empId param and compId in body
router.get('/:empId/delete', user_controller.detail_delete_get);

module.exports = router;
