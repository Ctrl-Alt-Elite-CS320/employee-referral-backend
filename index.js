const express = require("express");
const app = express();

const cors = require('cors')
const dotenv = require('dotenv');
dotenv.config();





// ---- AUTH0 AUTHENTICATION -----

// const { auth } = require('express-openid-connect');

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: 'a long, randomly-generated string stored in env',
//   baseURL: 'http://localhost:6500',
//   clientID: 'xsKU505s8cZiWbKniZenJqedNGP6K6hT',
//   issuerBaseURL: 'https://dev-2huf9bd9.auth0.com'
// };

// // auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));
// const { requiresAuth } = require('express-openid-connect');

// app.get('/profile', requiresAuth(), (req, res) => {
//   res.send(JSON.stringify(req.oidc.user));
// });

// // req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });


// ------ END AUTHENTICATION -----
=======

app.use(cors({
	origin: 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const hello = require("./routes/hello");
const auth = require("./routes/auth.routes");
auth(app);

// ----- Uncomment for user routes once implemented --------
// const user = require("./routes/user.routes");
// user(app);


app.use("/hello", hello);
const positions = require("./routes/positions");
app.use("/positions", positions);
const users = require("./routes/users");
app.use("/users", users);

const port = process.env.PORT || 6500;
app.listen(port, function () {
  console.log(`Starting a server at port ${port}`);
}); //starts a server at this specific port
