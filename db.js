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

function issueQuery(p, query) {
	try {
		const results = await p.query(query);
	} catch (err) {
		console.err(err);
	}
	return results;
}

module.exports = {
	pool,
	db:{
		getPositions:function(p){
			return issueQuery(p, "select * from position");
		}
	}
}
