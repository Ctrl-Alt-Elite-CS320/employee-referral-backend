const express = require("express");
const app = express();

const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();

app.use(cors({
	origin: 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hello = require("./routes/hello");
const auth = require("./routes/auth.routes");
auth(app);

app.use("/hello", hello);
const positions = require("./routes/positions");
app.use("/positions", positions);
const users = require("./routes/users");
app.use("/users", users);

const port = process.env.PORT || 4000;
app.listen(port, function () {
  console.log(`Starting a server at port ${port}`);
}); //starts a server at this specific port
