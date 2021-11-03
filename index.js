const express = require("express");
const app = express();
const dbp = require("./db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hello = require("./routes/hello");
app.use("/hello", hello);

const positions = require("./routes/positions")
app.use("/positions", positions);

app.get("/employees", async function(req, res){
  let results = await db.getAllEmployees(pool);
  res.send(results["rows"]);
})



const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log(`Starting a server at port ${port}`);
}); //starts a server at this specific port
