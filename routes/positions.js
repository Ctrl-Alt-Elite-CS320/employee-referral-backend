//referral route module
const express = require("express");
const router = express.Router();
const authJwt = require("../middleware/authJwt");
//require controller module
const position_controller = require('../controllers/positionController');

// POSITION ROUTES //

//GET all positions in the company
router.get("/all", position_controller.all_filtered_get);

//POST new position
router.post("/new", [authJwt.verifyToken], position_controller.new_post);

//GET position with id
router.get("/:id", position_controller.detail_get);

//GET all applications for position with id
router.get("/:id/applications/all", [authJwt.verifyToken], position_controller.applications_all_get);

//GET application with given id for position with id
router.get("/:id/applications/:appId", position_controller.applications_all_get);

//POST new application for position with id
router.post("/:id/applications/new", [authJwt.verifyToken], position_controller.new_application_post);

//GET delete confirmation for position with id
router.get("/:id/delete", position_controller.delete_get);

//GET delete confirmation for application with appId for position with id
router.get("/:id/applications/:appId/delete", position_controller.application_delete_get);

module.exports = router;
