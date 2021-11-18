//const db = require("../models");
const db = require("../db");
const config = require("../config/auth.config");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

// exports.signup = (req, res) => {
//   // Save User to Database
//   User.create({
//     username: req.body.username,
//     email: req.body.email,
//     password: bcrypt.hashSync(req.body.password, 8)
//   })
//     .then(user => {
//       if (req.body.roles) {
//         Role.findAll({
//           where: {
//             name: {
//               [Op.or]: req.body.roles
//             }
//           }
//         }).then(roles => {
//           user.setRoles(roles).then(() => {
//             res.send({ message: "User was registered successfully!" });
//           });
//         });
//       } else {
//         // user role = 1
//         user.setRoles([1]).then(() => {
//           res.send({ message: "User was registered successfully!" });
//         });
//       }
//     })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
// };
let users = [
  { id: 1, username: "smonzon@umass.edu", password: bcrypt.hashSync("password", 8) },
];




exports.signin = async (req, res) => {
  // let pass = await db.db.getPasswordForUsername(db.pool, req.body.username);
  // res.status(202).send({ pass: pass });
  // return;
  
  
  let user = users.find((elem) => elem.username === req.body.username);
  try {
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    console.log(user);

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    var token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    var authorities = [];
    res.status(200).send({
      id: user.id,
      username: user.username,
      roles: authorities,
      accessToken: token
    });
    // user.getRoles().then(roles => {
    //   for (let i = 0; i < roles.length; i++) {
    //     authorities.push("ROLE_" + roles[i].name.toUpperCase());
    //   }
        
    // });
  } catch (err) {
      res.status(500).send({ message: err.message });
    
  }
    
};