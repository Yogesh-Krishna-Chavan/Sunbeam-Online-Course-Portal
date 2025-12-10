const router = require("express").Router();
const { USER_TABLE, STUDENT_TABLE } = require("../config");
const { pool } = require("../db-connection/db");
const cryptoJs = require("crypto-js");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// POST: registers a student into a course
router.post("/register-to-course", (request, response) => {
  const { name, email, courseId, mobileNo } = request.body;

  // 1. check if student exists
  const checkEmailExists = `SELECT * FROM ${USER_TABLE} WHERE email = ?`;

  pool.query(checkEmailExists, [email], (error, checkEmailResult) => {
    if (error) return response.send(errorResponse(error));

    // 2. if student does not exits (then add it into users table)
    if (checkEmailResult.length === 0) {
      // a. new student data to be added into users table with default password
      const defaultPassword = "sunbeam";
      const hashPassword = String(cryptoJs.SHA256(defaultPassword));
      console.log("hashPassword", hashPassword);

      const insertSQL = `INSERT INTO ${USER_TABLE} (email, password) VALUES (?, ?)`;

      pool.query(insertSQL, [email, hashPassword], (error, insertResponse) => {
        if (error) return response.send(errorResponse(error));

        if (insertResponse.affectedRows === 0)
          return response.send(errorResponse("something went wrong"));

        // student added successfully into users table
      });
    }

    // 3. if student exists, check if he already registered to the course
    const checkSQL = `SELECT * FROM ${STUDENT_TABLE} WHERE email = ? AND course_id = ?`;

    pool.query(checkSQL, [email, courseId], (error, checkResponse) => {
      if (error) return response.send(errorResponse(error));

      if (checkResponse.length > 0)
        return response.send(
          errorResponse(`You’re already enrolled in this course.`)
        );

      // 4. if record not found, then add the data into students table (ie, registers for course)
      const registerSQL = `INSERT INTO ${STUDENT_TABLE} (email, course_id, name, mobile_no)
            VALUES (?, ?, ?, ?)`;

      pool.query(
        registerSQL,
        [email, courseId, name, mobileNo],
        (error, registerSqlResponse) => {
          if (error) return response.send(errorResponse(error));

          if (registerSqlResponse.affectedRows === 0)
            return response.send(errorResponse("something went wrong"));

          return response.send(
            successResponse(`Registration to course successful.`)
          );
        }
      );
    });
  });
});

// PUT: change password
router.put("/change-password/:email", (request, response) => {
  const { email } = request.params;
  const { newPassword, confirmPassword } = request.body;

  if (newPassword !== confirmPassword)
    return response.send(
      errorResponse(`New password and confirmation do not match.!`)
    );

  const hashPassword = String(cryptoJs.SHA256(newPassword));

  const sql = `UPDATE ${USER_TABLE} SET password = ? WHERE email = ?`;

  pool.query(sql, [hashPassword, email], (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.affectedRows === 0)
      return response.send(successResponse("Incorrect email."));

    return response.send(successResponse(`Password updated successfully.`));
  });
});

module.exports = router;
