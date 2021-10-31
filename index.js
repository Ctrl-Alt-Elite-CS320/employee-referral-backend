const express = require("express");
const app = express();
const dbp = require("./db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hello = require("./routes/hello");
app.use("/hello", hello);

app.get("/all", async (req, res) => {
	//const results = await pool.query("insert into candidate (email, phone, firstname, lastname) values ('cwbarry@umass.edu', 6179454920, Chris, Barry)");
	const results = await db.getPositionsOther(pool, [
		"title = 'Software Engineer I'",
		"salary > 75000"
	])
	console.log(results["rows"]);
	res.send({"results": results["rows"]});
});

const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log(`Starting a server at port ${port}`);
}); //starts a server at this specific port
