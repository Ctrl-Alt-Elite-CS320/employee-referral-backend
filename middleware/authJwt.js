const jwt = require("jsonwebtoken");
const db = require("../db");
const config = require("../config/auth.config.js");


verifyToken = (req, res, next) => {
  
  console.log("VERIFY");
  console.log(req.headers);
  let token = req.headers.authorization;
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  token = token.split(" ")[1];
  req.userId = "";
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.employeeId = decoded.employeeId;
    req.userIsManager = decoded.isManager;
    req.userCompanyId = decoded.companyId;
    next();
  });
};


//TODO: implement isManager

isManager = (req, res, next) => {

}


const authJwt = {
  verifyToken: verifyToken,
  isManager: isManager,
};
module.exports = authJwt;