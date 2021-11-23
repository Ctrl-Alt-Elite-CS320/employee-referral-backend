//referral route module
const express = require("express");
const router = express.Router();

//require controller module
const position_controller = require('../controllers/positionController');

// POSITION ROUTES //

//GET all positions in the company
router.get("/all", position_controller.all_filtered_get);

//GET form for new position
router.get("/new", position_controller.new_get);

//POST new position
router.post("/new", position_controller.new_post);

//GET position with id
router.get("/:id", position_controller.detail_get);

//GET all applications for position with id
router.get("/:id/applications/all", position_controller.applications_all_get);

//GET application with given id for position with id
router.get("/:id/applications/:appId", position_controller.applications_all_get);

//GET form for new application for position with id
router.get("/:id/applications/new", position_controller.new_application_get);

//POST new application for position with id
router.post("/:id/applications/new", position_controller.new_application_post);

//GET delete confirmation for position with id
router.get("/:id/delete", position_controller.delete_get);

//GET delete confirmation for application with appId for position with id
router.get("/:id/applications/:appId/delete", position_controller.application_delete_get);

module.exports = router;
