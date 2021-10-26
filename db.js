const Pool = require("pg").Pool;

const pool = new Pool({
	"user":"cae",
	"password":"burgernuggetsnuggetsburger",
	"database":"caedb",
	"host":"localhost",
	"port":5432,
	"max":20,
	"connectionTimeoutMillis":0,
	"idleTimeoutMillis":0
});//TODO: determine ideal values for connectionTimeoutMillis and idleTimeoutMillis

async function issueQuery(p, query) {
	let results = {}
	try {
		results = await p.query(query);
	} catch (err) {
		console.error(err);
	}
	return results;
}

function sanitizeString(s) {
	/* Makes the input string safe for postgresql to intake (preserves ' etc.), or returns the passed-in object if it isn't a string.*/
	if(typeof s === "string"){
		return "E'" + s.replace("'", "\\x27") + "'";
	} else {
		return s;
	}
}

module.exports = {
	pool,
	db:{
		insertEmployeeFromJSON:function(p, obj){
			Object.keys(obj).forEach(key => {
				obj[key] = sanitizeString(obj[key]);
			})
			const q = `insert into employee(
					firstName,
					lastName,
					email,
					employeeId,
					companyId, 
					companyName,
					positionTitle,
					startDate,
					isManager,
					password
				) values (
					${obj.firstName},
					${obj.lastName},
					${obj.email},
					${obj.employeeId},
					${obj.companyId},
					${obj.companyName},
					${obj.positionTitle},
					${obj.startDate},
					${obj.isManager},
					${obj.password}
				);`
			return issueQuery(p, q);
		},
		insertPositionFromJSON:function(p, obj, user){
			/**
			 * Read in a JSON containing data for a new position and insert it into the database after sanitizing the strings therein.
			 * 
			 * :param: p: pool of postgres clients which handles the insert command to the database
			 * :param: obj: JSON to be put into the database, after fixing all its strings.
			 * 
			 * :return: pg JSON from the insert statement; results.rows in this case should include the id of the newly created position
			 */
			Object.keys(obj).forEach(key => {
				obj[key] = sanitizeString(obj[key]);
			});
			const q = `insert into position(
					datePosted,
					title,
					salary,
					description,
					minYearsExperience,
					postedByCompanyId,
					postedByEmpId
				) values (
					current_timestamp,
					${obj.title},
					${obj.salary},
					${obj.description},
					${obj.minYearsExperience},
					${user.companyId},
					${user.employeeId}
				) returning id;`
			return issueQuery(p, q);
		},
		getPasswordForUsername:async function(p, username){
			/* Get the password for the employee with the given username. */
			return await issueQuery(p, `select password from employee where email=${username}`);
		},
		getEmployeeForUsername:async function(p, username){
			/* Get all fields of data associated with the given email address */
			return await issueQuery(p, `select * from employee where email=${username}`);
		},
		getPositions: async function(p, numberToRetrieve, offset, companyId){
			/**
			 * Get the specified number of entries from position table, starting at the n-th entry, where n= the offset parameter.
			 * 
			 * :param: p: pool object that calls query
			 * :param: numberToRetrieve: how many rows to pull from the database
			 * :param: offset: how many rows have already been seen, and should thus be skipped (to avoid re-rendering the same post in infinite scroll)
			 * :param: companyId: what company's positions to search thru
			 * 
			 * :return: object containing the results of the p.query call
			 */
			return await p.query(`select * from position where postedByCompanyId=${companyId} limit ${numberToRetrieve} offset ${offset}`);
		},
		/* NOTE: For tables with serial/bigserial data types in the ID column, we can do insert statements which return the id
		         using the RETURNING keyword. Very convenient in backend
		*/
		registerUser: async function (p, firstName, lastName, email, employeeId, companyId, companyName, positionTitle, startDate, isManager, password) {
			return await issueQuery(p, `insert into employee(firstName, lastName, email, employeeId, companyId, companyName, positionTitle, startDate, isManager, password) values (${firstName}, ${lastName}, ${email}, ${employeeId}, ${companyId}, ${companyName}, ${positionTitle}, ${startDate}, ${isManager}, ${password})`);
		},
		/**
		 * Add new position record into to position table
		 * 
		 * @param {Pool} p: pool object that calls query
		 * @param {string} datePosted: the date in which position was posted. Should be 'YYYY-MM-DD' format
		 * @param {string} title: position title
		 * @param {number} salary: position salary
		 * @param {string} description: position description
		 * @param {number} minYearsExperience: minimum years of experience required for position
		 * @param {number} postedByCompanyId: the company id of the employee who posted the position
		 * @param {number} postedByEmpId: the employee id of the employee who posted the position
		 * @returns: object containing the results of the p.query call
		 */
		addPosition: async function (p, datePosted, title, salary, description, minYearsExperience, postedByCompanyId, postedByEmpId) {
			return await issueQuery(p, `insert into positions(datePosted, title, salary, description, minYearsExperience, postedByCompanyId, postedByEmpId) values (${datePosted}, ${title}, ${salary}, ${description}, ${minYearsExperience}, ${postedByCompanyId}, ${postedByEmpId})`);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} candEmail 
		 * @param {*} candPhone 
		 * @param {*} candFirst 
		 * @param {*} candLast 
		 * @param {*} date 
		 * @param {*} applyingFor 
		 * @param {*} candDescription 
		 * @param {*} referredByEmployeeId 
		 * @param {*} referredByCompanyId 
		 * @returns 
		 */
		addApp: async function (p, candEmail, candPhone, candFirst, candLast, date, applyingFor, candDescription, referredByEmployeeId, referredByCompanyId) {
			let candInfo = await issueQuery(p, `insert into candidate(email, phone, firstName, lastName) values (${candEmail}, ${candPhone}, ${candFirst}, ${candLast})`);
			let referralInfo = await issueQuery(p, `insert into app(dateTime, applyingFor, candDescription, referredByEmployeeId, referredByCompanyId, applicantCandEmail) values (${date}, ${applyingFor}, ${candDescription}, ${referredByEmployeeId}, ${referredByCompanyId}, ${candEmail})`);
			return (candInfo, referralInfo);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} currPosId 
		 * @param {*} attributes 
		 * @returns 
		 */
		updatePosition: async function (p, currPosId, attributes) {
			if (attributes == None || Object.keys(attributes).length == 0) {
				return None;
			}
			str = "(";
			for ([key, value] of Object.entries(attributes)) {
				str = str.concat(`${key} = ${value},`);
			}
			str = str.substring(0, str.length - 1);
			str = str.concat(")");
			return await issueQuery(p, `update position set ${str} where id = ${currPosId}`)
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} id 
		 * @returns 
		 */
		deletePosition: async function (p, id) {
			return await issueQuery(p, `delete position where id = ${id}`);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} id 
		 * @returns 
		 */
		deleteApp: async function (p, id) {
			return await issueQuery(p, `delete app where id = ${id}`);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} positionId 
		 * @returns 
		 */
		getApplications: async function(p, positionId){
			return await issueQuery(p, `select * from app where applyingFor = ${positionId}`);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} managerCompanyId 
		 * @param {*} managerEmpId 
		 * @returns 
		 */
		getPositionsPostedByManager: async function(p, managerCompanyId, managerEmpId){
			return await issueQuery(p, `select * from position where postedByCompanyId = ${managerCompanyId} and postedByEmpId=${managerEmpId}`);
		},
		/**
		 * 
		 * @param {*} p 
		 * @param {*} attributes 
		 * @returns 
		 */
		getPositionsOther: async function (p, attributes) {
			if (attributes == None || Object.keys(attributes).length == 0) {
				return None;
			}
			str = "";
			for ([key, value] of Object.entries(attributes)) {
				str = str.concat(`${key} = ${value} AND`);
			}
			str = str.substring(0, str.length - 4);
			return await issueQuery(p, `select * from position where ${str}`)
		}

	}
}
