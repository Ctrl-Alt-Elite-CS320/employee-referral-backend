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
	try {
		const results = await p.query(query);
	} catch (err) {
		console.err(err);
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
		getPasswordForUsername:function(p, username){
			/* Get the password for the employee with the given username. */
			return issueQuery(p, `select password from employee where email=${username}`);
		},
		getEmployeeForUsername:function(p, username){
			/* Get all fields of data associated with the given email address */
			return issueQuery(p, `select * from employee where email=${username}`);
		},
		getPositions:function(p, numberToRetrieve, offset, companyId){
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
			return issueQuery(p, `select * from position where postedByCompanyId=${companyId} limit ${numberToRetrieve} offset ${offset}`);
		}
		/* NOTE: For tables with serial/bigserial data types in the ID column, we can do insert statements which return the id
		         using the RETURNING keyword. Very convenient in backend
		*/
		
	}
}
