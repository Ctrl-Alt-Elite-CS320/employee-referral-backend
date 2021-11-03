const express = require('express');
const router = express.Router();
const dbp = require('../db.js');
const db = dbp.db;
const pool = dbp.pool;


//sends back all position objects in array
router.get('/', async function(req, res){
    let results = await pool.query("select * from position");
    res.send(results["rows"]);
});

/**
 * sends back filtered results in array of objects
 * 
 * queries:
 * salaryGt - salary greater than a certain number
 * salaryLt - salary less than a certain number
 * title - position title
 * minYearsExperience - minimum years of experience
 */
router.get('/filter', async function(req, res){
    conditions = []
    for(var q in req.query){
        console.log(q);
    }
    if(!req.query){
        res.status(400).send("No queries")
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
});

/**
 * sends back results filtered by company ID
 * @param compId company ID
 */
router.get('/:compId', async function(req, res){
    let id = req.params.compId;
    let limit = 10000;
    let offset = 0;
    if(req.query.limit){
        parseInt(limit, req.query.limit);
    }
    if(req.query.offset){
        parseInt(offset, req.query.offset);
    }
    if(!id){
        res.status(400).send("Missing parameter id");
    }
    let results = await db.getPositions(pool, limit, offset, compId);
    res.send(results["rows"]);
});

/**
 * sends back results filtered my company ID and manager employee ID
 * @param compId manager's company ID
 * @param empId manager's employee ID
 */
router.get('/:compId/:empId', async function(req, res){
    if(!req.params){
        res.status(400).send("Missing all parameters");
    }
    let empId = req.params.empId;
    let compId = req.params.compId;
    if(!empId){
        res.status(400).send("Missing Employee ID");
    }
    if(!compId){
        res.status(400).send("Missing Company ID");
    }
    let results = await db.getPositionsPostedByManager(pool, compId, empId);
    res.send(results["rows"]);
});

module.exports = router;