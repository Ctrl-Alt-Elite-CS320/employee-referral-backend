const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.send("Hello the server is on!");
});

module.exports = router;
