const { body,validationResult } = require("express-validator");
const dbp = require("../db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

exports.applications_get = async (req, res) => {
	    res.send('not implemented: list of user\'s applications')
};

exports.detail_get = async (req, res) => {
	if(!req.params.compId){
		res.status(400).send("Missing compId");
	}
	else if(!req.params.empId){
		res.status(400).send("Missing empId");
	}else{
		let results = await db.issueQuery(pool, `select * from employee where companyId=${req.params.compId} and employeeId=${req.params.empId}`);
		if(results["rows"].length == 0){
			res.status(404).send("NOT_FOUND");
		}else{
			res.send(results["rows"]);
		}
	}
};

exports.signup_get = async (req, res) => {
	    res.send('not implemented: new user signup form GET')
};

exports.signup_post = async (req, res) => {
	    res.send('not implemented: new user signup form post')
};

exports.detail_delete_get = async (req, res) => {
	if(!req.params.compId){
		res.status(400).send("Missing compId");
	}
	else if(!req.params.empId){
		res.status(400).send("Missing empId");
	}else{
		let results = await db.issueQuery(pool, `DELETE from employee where companyid=${req.params.compId} and employeeid=${req.params.empId}`);
		if(results["rowCount"] == 0){
			res.status(404).send("NOT_FOUND");
		}else{
			res.send("SUCCESS")
		}
	}
};
