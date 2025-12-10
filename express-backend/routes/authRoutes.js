const router = require("express").Router();
const { USER_TABLE, JWT_SECRET_KEY } = require("../config");
const { pool } = require("../db-connection/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

// POST: user login (student, admin)
router.post("/login", (request, response) => {
  const { email, password } = request.body;

  const hashPassword = String(cryptoJs.SHA256(password));

  const sql = `SELECT * FROM ${USER_TABLE} WHERE email = ? AND password = ?`;

  pool.query(sql, [email, hashPassword], (error, results) => {
    if (error) return response.send(errorResponse(error));

    // if user does not exists
    if (results.length === 0)
      return response.send(errorResponse("Invalid email or password!"));

    // if user exists
    const user = results[0];

    // creating token
    const token = jwt.sign(
      { email: user.email, role: user.role },
      JWT_SECRET_KEY
    );

    const message = {
      message: "login successful",
      token,
    };

    return response.send(successResponse(message));
  });
});

module.exports = router;
