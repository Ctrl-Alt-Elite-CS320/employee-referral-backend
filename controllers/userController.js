const { body,validationResult } = require("express-validator");
const dbp = require("./db");
const pool = dbp.pool;//connection pool to psql
const db = dbp.db;//helper function library object

exports.applications_get = async (req, res) => {
    res.send('not implemented: list of user\'s applications')
};

exports.detail_get = async (req, res) => {
    res.send('not implemented: user profile page')
};

exports.signup_get = async (req, res) => {
    res.send('not implemented: new user signup form GET')
};

exports.signup_post = async (req, res) => {
    res.send('not implemented: new user signup form post')
};

exports.detail_delete_get = async (req, res) => {
    res.send('not implemented: delete specified user & get confirmation')
};