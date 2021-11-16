const { body,validationResult } = require("express-validator");
const dbp = require("../db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

exports.all_get = async (req, res) => {
    res.send('not implemented: list of positions');
};

exports.all_filtered_get = async (req, res) => {
    res.send('not implemented: list of positions w/ filters');
};

exports.detail_get = async (req, res) => {
    res.send('not implemented: details of position w/ given id:' + req.params.id);
};

exports.applications_all_get = async (req, res) => {
    res.send('not implemented: show applications for position w/ given id:' + req.params.id);
};

exports.application_detail_get = async (req, res) => {
    res.send('not implemented: show application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
};

exports.new_get = async (req, res) => {
    res.send('not implemented: get form to create new position');
};

exports.new_post = async (req, res) => {
    res.send('not implemented: post new position');
};

exports.new_application_get = async (req, res) => {
    //TODO: make 'application_form' view using whatever library
    res.render('application_form', { title: 'Create New Application', positionId: req.params.id });
};

exports.new_application_post = [
    //res.send('not implemented: post new application for position w/ given id:' + req.params.id);

    //TODO: validate that position id exists, get employee id from req, and company id from req too
    async(req, res, next) => {
        var posId = req.params.id;
        var q = `select exists (select * from position where id=${posId});`
        //must ensure that posId is a number before querying it--security
        if (Number.isFinite(posId) || /^\d+$/.test(posId)){
            const results = await db.issueQuery(pool, q);
            if (results.rows[0].exists != 't'){
                res.status(404).render('site_404', { title: 'Not found' });//FIXME: site_404 react component (make/find it)
                return;
            }
        } else {
            res.status(404).render('site_404', { title: 'Not found' });//FIXME: same as above
            return;
        }
    },
    body('candDescription', 'Give a brief description of why the candidate is a good fit').trim().isLength({min:1}).escape(),
    body('applicantCandEmail', 'Invalid email address').isEmail(),

    //after validation, process request
    async (req, res, next) => {
        const errors = validationResult(req);
        var app = {
            applyingFor:1,//fixme, should be positionId
            candDescription:req.body.candDescription,
            referredByEmployeeId:1,//fixme, empId of active user
            referredByCompanyId:1,//fixme, company id
            applicantCandEmail:req.body.applicantCandEmail
        };

        if (!errors.isEmpty()){
            //recall the form with error messages
            res.render('application_form', { title: 'Create New Application', positionId: req.params.id, candDescription: req.body.candDescription, applicantCandEmail: req.body.applicantCandEmail, errors: errors.array() });
            return;
        } else {
            //TODO: redirect to view confirmation
            await db.insertApplicationFromJSON(pool, app);
            //res.render('view confirmation')
        }
    }
];

exports.delete_get = async (req, res) => {
    res.send('not implemented: get congirmation for deleting position w/ given id:' + req.params.id);
};

exports.application_delete_get = async (req, res) => {
    res.send('not implemented: get confirmation page or deleting application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
};
