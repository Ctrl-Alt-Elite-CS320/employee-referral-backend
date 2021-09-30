const express = require("express");
const app = express();
const pool = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hello = require("./routes/hello");
app.use("/hello", hello);

app.get("/all", async (req, res) => {
	const results = await pool.query("select * from employee");
	console.log(results);
	res.send({"results": results});
});

const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log(`Starting a server at port ${port}`);
}); //starts a server at this specific port
