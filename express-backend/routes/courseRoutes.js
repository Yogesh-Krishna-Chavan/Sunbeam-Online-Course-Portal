const router = require("express").Router();
const { COURSE_TABLE } = require("../config");
const { pool } = require("../db-connection/db");
// const { checkAdminRole } = require("../middlewares/authMiddleware");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// GET: get all active courses
router.get("/all-active-courses", (request, response) => {
  const currentDate = new Date();

  const sql = `SELECT * FROM ${COURSE_TABLE} WHERE end_date >= ?`;

  pool.query(sql, [currentDate], (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.length === 0)
      return response.send(successResponse("No Courses Found."));

    return response.send(successResponse(results));
  });
});

// router.use(checkAdminRole);

// GET: get all courses (filter datewise)
router.get("/all-courses", (request, response) => {
  const { startDate, endDate } = request.query;

  let sql = `SELECT * FROM ${COURSE_TABLE}`;

  const params = [];

  // Add filters
  if (startDate && endDate) {
    sql += ` WHERE start_date >= ? AND end_date <= ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` WHERE start_date >= ?`;
    params.push(startDate);
  } else if (endDate) {
    sql += ` WHERE end_date <= ?`;
    params.push(endDate);
  }

  pool.query(sql, params, (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.length === 0)
      return response.send(successResponse("No Records Found."));

    return response.send(successResponse(results));
  });
});

// POST: add a new course
router.post("/add", (request, response) => {
  const { courseName, description, fees, startDate, endDate, videoExpireDays } =
    request.body;

  const sql = `INSERT INTO ${COURSE_TABLE} 
            (course_name, description, fees, start_date, end_date, video_expire_days) 
            VALUES (?, ?, ?, ?, ?, ?)`;

  pool.query(
    sql,
    [courseName, description, fees, startDate, endDate, videoExpireDays],
    (error, results) => {
      if (error) return response.send(errorResponse(error));

      return response.send(successResponse("Course added successfully."));
    }
  );
});

// PUT: update a course by courseId
router.put("/update/:courseId", (request, response) => {
  const { courseName, description, fees, startDate, endDate, videoExpireDays } =
    request.body;

  const { courseId } = request.params;

  const sql = `UPDATE ${COURSE_TABLE} 
        SET course_name = ?, description = ?, fees = ?, start_date = ?, end_date = ?, video_expire_days = ? 
        WHERE course_id = ?`;

  pool.query(
    sql,
    [
      courseName,
      description,
      fees,
      startDate,
      endDate,
      videoExpireDays,
      courseId,
    ],
    (error, results) => {
      if (error) return response.send(errorResponse(error));

      if (results.affectedRows === 0)
        return response.send(
          errorResponse(`No course found with Id: ${courseId}`)
        );

      return response.send(successResponse("Course updated successfully."));
    }
  );
});

// DELETE: delete a course by courseId
router.delete("/delete/:courseId", (request, response) => {
  const { courseId } = request.params;
  console.log("request.params: course api: ", { ...request.params });

  const sql = `DELETE FROM ${COURSE_TABLE} WHERE course_id = ?`;

  pool.query(sql, [courseId], (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.affectedRows === 0)
      return response.send(
        errorResponse(`No course found with Id: ${courseId}`)
      );

    return response.send(successResponse("Course deleted successfully."));
  });
});

module.exports = router;
