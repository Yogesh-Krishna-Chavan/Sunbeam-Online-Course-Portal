const router = require("express").Router();
const { STUDENT_TABLE, COURSE_TABLE } = require("../config");
const { pool } = require("../db-connection/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// GET: /admin/test
router.get("/test", (request, response) => {
  const sql = `SELECT * FROM ${STUDENT_TABLE}`;

  pool.query(sql, (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.length === 0)
      return response.send(successResponse("No Students Found."));

    return response.send(successResponse(results));
  });
});

module.exports = router;
