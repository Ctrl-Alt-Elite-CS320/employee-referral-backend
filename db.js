const Pool = require("pg").Pool;

const pool = new Pool({
	"user":"cae",
	"password":"burgernuggetsnuggetsburger",
	"database":"testdb",
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
		issueQuery:async function (p, query) {
			let results = {}
			try {
				results = await p.query(query);
			} catch (err) {
				console.error(err);
			}
			return results;
		},
		sanitizeString:function (s) {
			/* Makes the input string safe for postgresql to intake (preserves ' etc.), or returns the passed-in object if it isn't a string.*/
			if(typeof s === "string"){
				return "E'" + s.replace("'", "\\x27") + "'";
			} else {
				return s;
			}
		},
		insertApplicationFromJSON:function(p,obj){
			Object.keys(obj).forEach(key => {
				obj[key] = sanitizeString(obj[key]);
			})
			const q = `insert into app(
				dateTime,
				applyingFor,
				candDescription,
				referredByEmployeeId,
				referredByCompanyId,
				candEmail,
				candPhone,
				candFirstName,
				candLastName
			) values (
				current_timestamp,
				${obj.applyingFor},
				${obj.candDescription},
				${obj.referredByEmployeeId},
				${obj.referredByCompanyId},
				${obj.candEmail},
				${obj.candPhone},
				${obj.candFirstName},
				${obj.candLastName}
			);`
			return issueQuery(p,q);
		},

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
			return await issueQuery(p, `select password from employee where email = '${username}'`);
		},
		//TODO
		getEmployeeForUsername:async function(p, username){
			/* Get all fields of data associated with the given email address */
			return await issueQuery(p, `select * from employee where email='${username}'`);
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
		getManagerEmailFromPosition: async function (p, positionId, companyId) {
			console.log("OI");
			let positionQuery = await p.query(`select postedByEmpId from position where postedByCompanyId=${companyId} and id=${positionId}`);
			if (positionQuery.rows) {
				console.log("hi");

				let position = positionQuery.rows[0];
				console.log(position);
				let managerQuery = await p.query(`select email from employee where employeeId=${position.postedbyempid} and companyId=${companyId}`);
				if (managerQuery.rows) {
					let managerEmail = managerQuery.rows[0].email;
					return managerEmail;
				}
			}
			return null;
		},

		/* NOTE: For tables with serial/bigserial data types in the ID column, we can do insert statements which return the id
		         using the RETURNING keyword. Very convenient in backend
		*/
		registerUser: async function (p, firstName, lastName, email, employeeId, companyId, companyName, positionTitle, startDate, isManager, password) {
			return await issueQuery(p, `insert into employee(firstName, lastName, email, employeeId, companyId, companyName, positionTitle, startDate, isManager, password) values ('${firstName}', '${lastName}', '${email}', ${employeeId}, ${companyId}, '${companyName}', '${positionTitle}', '${startDate}', ${isManager}, '${password}')`);
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
		 * @returns: object containing the results of the p.query call.
		 */
		addPosition: async function (p, datePosted, title, salary, description, minYearsExperience, postedByCompanyId, postedByEmpId) {
			return await issueQuery(p, `insert into position(datePosted, title, salary, description, minYearsExperience, postedByCompanyId, postedByEmpId) values ('${datePosted}', '${title}', ${salary}, '${description}', ${minYearsExperience}, ${postedByCompanyId}, ${postedByEmpId})`);
		},
		/** Add new application record into app table
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {string} candEmail: the candidate's email address
		 * @param {number} candPhone: the candidate's phone number
		 * @param {string} candFirst: the candidate's first name
		 * @param {string} candLast: the candidate's last name
		 * @param {string} date: the date in which the application was posted. Should be in the 'YYYY-MM-DD' format
		 * @param {number} applyingFor: the id number of the position the candidate is applying for
		 * @param {string} candDescription: the description of the candidate
		 * @param {number} referredByEmployeeId: the employee id of the employee the candidate is being referred by
		 * @param {number} referredByCompanyId: the company id of the employee the candidate is being referred by
		 * @returns object containing the results of the p.query call.
		 */
		addApp: async function (p, candEmail, candPhone, candFirst, candLast, date, applyingFor, candDescription, referredByEmployeeId, referredByCompanyId) {
			let candInfo = await issueQuery(p, `insert into candidate(email, phone, firstName, lastName) values ('${candEmail}', ${candPhone}, '${candFirst}', '${candLast}')`);
			let referralInfo = await issueQuery(p, `insert into app(dateTime, applyingFor, candDescription, referredByEmployeeId, referredByCompanyId, applicantCandEmail) values ('${date}', ${applyingFor}, '${candDescription}', ${referredByEmployeeId}, ${referredByCompanyId}, '${candEmail}')`);
			return [candInfo, referralInfo];
		},
		/** Updates a specific position's parameters bases on its id
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {number} currPosId: the position's id
		 * @param {object} attributes: object of attributes needed to be updated. Ex: {salary: 110000, title:"Software Engineer II"}
		 * @returns object containing the results of the p.query call
		 */
		updatePosition: async function (p, currPosId, attributes) {
			if (Object.keys(attributes).length == 0) {
				return {results:{}};
			}
			str = "";
			for ([key, value] of Object.entries(attributes)) {
				if(typeof value == "string"){
					str = str.concat(`${key} = '${value}',`);
				}else{
					str = str.concat(`${key} = ${value},`);
				}
			}
			str = str.substring(0, str.length - 1);
			console.log(str);
			return await issueQuery(p, `update position set ${str} where id = ${currPosId}`)
		},
		/** FOREIGN KEY CONSTRAINT ON APP TABLE PREVENTS DELETION
		 * deletes position based on position id
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {number} id: id number of the position
		 * @returns object containing the results of the p.query call
		 */
		deletePosition: async function (p, id) {
			return await issueQuery(p, `delete from position where id = ${id}`);
		},
		/**
		 * deletes application based on application id
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {number} id: id number of the application
		 * @returns object containing the results of the p.query call
		 */
		deleteApp: async function (p, id) {
			return await issueQuery(p, `delete from app where id = ${id}`);
		},
		/**
		 * gets list of applications based on the position id
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {number} positionId: id number of the position
		 * @returns object containing the results of the p.query call. Get list by accessing ["row"] key
		 */
		getApplications: async function(p, positionId){
			return await issueQuery(p, `select id, datetime, canddescription, applicantcandemail, candidate.phone as candphone, candidate.firstname as candfirst, candidate.lastname as candlast, employee.firstname as managerfirst, employee.lastname as managerlast, employee.email as manageremail 
				from app 
				inner join candidate 
				on applicantcandemail=email 
				inner join employee on referredbyemployeeid = employee.employeeid and referredbycompanyid=employee.companyid 
				where applyingfor = ${positionId}`);
		},
		getApplicationDetail: async function(p, appId){
			return await issueQuery(p, `select * from app where id = ${appId}`);
		},
		/**
		 * gets list of positions posted by a specific manager
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {number} managerCompanyId: company id of manager (employee)
		 * @param {number} managerEmpId: employee id of manager (employee)
		 * @returns object containing the results of the p.query call. Get list by accessing ["row"] key
		 */
		getPositionsPostedByManager: async function(p, managerCompanyId, managerEmpId){
			return await issueQuery(p, `select * from position where postedByCompanyId = ${managerCompanyId} and postedByEmpId=${managerEmpId}`);
		},
		/**
		 * gets positions based on certain conditional statements
		 *
		 * @param {Pool} p: pool object that calls query
		 * @param {[string]} attributes: array of strings that represent conditional statements. Ex: ["title = 'Software Engineer I'", "salary > 75000"]. MAKE SURE STRINGS VALUES ARE SURROUNDED BY ' '.
		 * @returns object containing the results of the p.query call. Get list by accessing ["row"] key
		 */
		getPositionsOther: async function (p, conditions) {
			if (Object.keys(conditions).length == 0) {
				return {results:{}};
			}
			str = "";
			for (const cond of conditions) {
				str = str.concat(`${cond} AND `);
			}
			str = str.substring(0, str.length - 5);
			return await issueQuery(p, `select * from position where ${str}`);
		}

	}
}
