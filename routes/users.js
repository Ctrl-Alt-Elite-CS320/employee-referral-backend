const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const router = express.Router();
const dbp = require('../db.js');
const db = dbp.db;
const pool = dbp.pool;

router.get("", async function(req, res){
    let results = await db.getAllEmployees(pool);
    console.log(req.body);
    if(req.body.email){
        results = await db.getEmployeeForUsername(pool, req.body.email);
    }
    res.send(results["rows"]);
});

router.post("/update", async function(req, res){
    attributes = {}
    if(!req.body.email){
        res.status(400).send("Missing email")
    }
    else{
        if(req.body.firstname){
            attributes["firstname"] = req.body.firstname;
        }
        if(req.body.lastname){
            attributes["lastname"] = req.body.lastname;
        }
        if(req.body.employeeid){
            attributes["employeeid"] = req.body.employeeid;
        }
        if(req.body.companyid){
            attributes["companyid"] = req.body.companyid;
        }
        if(req.body.companyname){
            attributes["companyname"] = req.body.companyname;
        }
        if(req.body.positiontitle){
            attributes["positiontitle"] = req.body.positiontitle;
        }
        if(req.body.startdate){
            attributes["startdate"] = req.body.startdate;
        }        
        if(req.body.ismanager){
            attributes["ismanager"] = req.body.ismanager;
        }
        if(req.body.password){
            attributes["password"] = req.body.password;
        }
        let results = await db.updateEmployee(pool, req.body.email, attributes);
        res.send(results);
    }
})

module.exports = router;