const { body,validationResult } = require("express-validator");
const dbp = require("../db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

//this isn't routed to anything at the moment
exports.all_get = async (req, res) => {
    let id = req.query.compId;
    let limit = 10000;
    let offset = 0;
    if(req.query.limit){
        parseInt(limit, req.query.limit);
    }
    if(req.query.offset){
        parseInt(offset, req.query.offset);
    }
    if(id == null){
        res.status(400).send("Missing parameter id");
      } else {
        let results = await db.getPositions(pool, limit, offset, id);
        res.send(results["rows"]);
        return;
    }
}

exports.all_filtered_get = async (req, res) => {
    conditions = []
    if(!req.query){
        res.status(400).send("No queries");
        return;
    }
    if(req.query.compId){
        conditions.push(`postedByCompanyId = ${req.query.compId}`);
    }
    if(req.query.empId){
        conditions.push(`postedByEmpId = ${req.query.empId}`);
    }
    if(req.query.salaryGt){
        conditions.push(`salary > ${req.query.salaryGt}`);
    }
    if(req.query.salaryLt){
        conditions.push(`salary < ${req.query.salaryLt}`);
    }
    if(req.query.title){
        conditions.push(`title = '${req.query.title}'`);
    }
    if(req.query.minYearsExperience){
        conditions.push(`minYearsExperience = ${req.query.minYearsExperience}`);
    }
    let results = await db.getPositionsOther(pool, conditions);
    res.send(results["rows"]);
}

exports.detail_get = async (req, res) => {
    let id = req.params.id;
    let results = {}
    if(!id){
        res.status(400).send("Missing position id");
        return;
    }else{
        results = await db.getPositionsOther(pool, `id = ${id}`);
    }
    res.send(results["rows"]);
};

exports.applications_all_get = async (req, res) => {
    let id = req.params.id;
    let results = {};
    if(!id){
        res.status(400).send("Specified job opening does not exist");
        return;
    } else {
        results = await db.getApplications(pool, id);
        if (results["rows"].length == 0){
            res.status(404).send("NOT FOUND");
            return;
        }
    }
    res.send(results["rows"]);
};

exports.application_detail_get = async (req, res) => {
    res.send('not implemented: show application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
    let id = req.params.id;
    let appId = req.params.appId;
    let results = {};
    if(!id){
        res.status(400).send("Specified job opening does not exist");
    } else if(!appId){
        res.status(400).send("Specified job referral does not exist");
    } else {
        results = await db.getApplicationsDetail(pool, id);
    }
    res.send(results["rows"]);
};

exports.new_get = async (req, res) => {
    res.send('not implemented: get form to create new position');
};

exports.new_post = async (req, res) => {
    
    let data = req.body;
    if(Object.entries(data) == 0){
        res.status(400).send("Empty body");
    }
    else if(!data.title){
        res.status(400).send("Missing title");
    }
    else if(!data.salary){
        res.status(400).send("Missing salary");
    }
    else if(!data.description){
        res.status(400).send("Missing description");
    }
    else if(!data.minYearsExperience){
        res.status(400).send("Missing minYearsExperience");
    }
    else if(!data.companyId){
        res.status(400).send("Missing companyId");
    }
    else if(!data.empId){
        res.status(400).send("Missing empId");
    }
    else{
        let results = await db.addPosition(pool, data.title, data.salary, data.description, data.minYearsExperience, data.companyId, data.empId);
        res.send(results["rows"]);
    }
};

exports.new_application_get = async (req, res) => {
    //TODO: make 'application_form' view using whatever library
    res.render('application_form', { title: 'Create New Application', positionId: req.params.id });
};

exports.new_application_post = [
    //res.send('not implemented: post new application for position w/ given id:' + req.params.id);

    //TODO: validate that position id exists, get employee id from req, and company id from req too
    async (req, res, next) => {
        var posId = parseInt(req.params.id); //req.params.id
        console.log("USER COMPANYID:", req.userCompanyId);
        var q = `select exists (select * from position where id=${posId} and postedbycompanyid=${req.userCompanyId});`
        //must ensure that posId is a number before querying it--security
        if (Number.isFinite(posId) || /^\d+$/.test(posId)){
            const results = await db.issueQuery(pool, q);
            if (!results.rows[0].exists) {
                console.log("A")
                res.status(400).send('the job posting you\'re looking for doesn\'t exist')
                return;
            }
        } else {
            console.log("B");
            res.status(400).send('the job posting you\'re looking for doesn\'t exist')
            return;
        }
        next();
    },
    //after validation, process request
    async (req, res, next) => {
        const errors = validationResult(req);
        var app = {
            applyingFor: req.params.id,//fixme, should be positionId
            candDescription: req.body.candidateDescription,
            referredByEmployeeId: req.employeeId,//fixme, empId of active user
            referredByCompanyId: req.userCompanyId,//fixme, company id
            candEmail: req.body.candidateEmail,
            candFirstName: req.body.candidateFirstname,
            candLastName: req.body.candidateLastname,
            candPhone: req.body.candidatePhone
        };
        console.log(app);
        if (!errors.isEmpty()){
            //recall the form with error messages
            res.render('application_form', { title: 'Create New Application', positionId: req.params.id, candDescription: req.body.candDescription, applicantCandEmail: req.body.applicantCandEmail, errors: errors.array() });
            return;
        } else {
            //TODO: redirect to view confirmation
            await db.insertApplicationFromJSON(pool, app);
            next();
            //res.render('view confirmation')
        }
    },
    async (req, res, next) => {
        let managerEmail = await db.getManagerEmailFromPosition(pool, req.params.id, req.userCompanyId);
        let nodemailer = require('nodemailer');
        let myEmail = 'admin@sinecureapp.com';
        let myPassword = 'ZBF3jUND5PgEZreMcVffFW7ERz8fCdySLoZu5UGb';
        let transporter = nodemailer.createTransport({
        host: 'mail.tommytran.io',
        secure: true,
        auth: {
            user: myEmail,
            pass: myPassword
        }
        });

        let mailOptions = {
        from: myEmail,
        to: managerEmail,
        subject: 'You have received a new referral for your position',
        text: 'Add an info message here',
        };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        // Even if email is not sent, should still show that client is referred
        res.status(200).send('Successfully referred');
});
    }
];

exports.delete_get = async (req, res) => {
    res.send('not implemented: get congirmation for deleting position w/ given id:' + req.params.id);
};

exports.application_delete_get = async (req, res) => {
    res.send('not implemented: get confirmation page or deleting application with id:' + req.params.appId + ' for position w/ given id:' + req.params.id);
};
