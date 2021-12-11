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
  { id: 1, username: "smonzon@umass.edu", password: bcrypt.hashSync("password", 8), isManager: true, companyId: 20021},
];




exports.signin = async (req, res) => {
  // res.status(202).send({ pass: pass });
  // return;
  // console.log(bcrypt.hashSync("password", 8));
  let user = await db.db.getEmployeeForUsername(db.pool, req.body.username);
  
  
  // let user = users.find((elem) => elem.username === req.body.username);
  try {
    if (!user.rows) {
      return res.status(404).send({ message: "User Not found." });
    }
    user = user.rows[0];
    // console.log(user);
    // console.log(req.body.password,
      // user.password);
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


    var token = jwt.sign({ employeeId: user.employeeid, isManager: user.ismanager, companyId: user.companyid}, config.secret, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      employeeId: user.employeeid,
      username: user.username,
      isManager: user.ismanager,
      accessToken: token
    });
    // user.getRoles().then(roles => {
    //   for (let i = 0; i < roles.length; i++) {
    //     authorities.push("ROLE_" + roles[i].name.toUpperCase());
    //   }
        
    // });
  } catch (err) {
    console.error(err);
      res.status(500).send({ message: err.message });
    
  }
    
};
