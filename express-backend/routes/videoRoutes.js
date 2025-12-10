const router = require("express").Router();
const { VIDEO_TABLE, COURSE_TABLE, STUDENT_TABLE } = require("../config");
const { pool } = require("../db-connection/db");
// const { checkAdminRole } = require("../middlewares/authMiddleware");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// GET: get all videos of a course registered by a student
router.get("/all/:email/:courseId", (req, res) => {
  const { email, courseId } = req.params;

  // SQL: check if student is registered for the course and video is not expired
  const sql = `SELECT v.*, c.video_expire_days
      FROM ${VIDEO_TABLE} v
      INNER JOIN ${STUDENT_TABLE} s ON s.course_id = v.course_id
      INNER JOIN ${COURSE_TABLE} c ON c.course_id = v.course_id
      WHERE s.email = ? AND s.course_id = ?
`;

  pool.query(sql, [email, courseId], (err, results) => {
    if (err) return res.send(errorResponse(err));

    // current date
    const now = new Date();

    // now.setDate(now.getDate() + 6);
    // console.log("now", now);

    const filteredVideos = results.filter((video) => {
      const expiry = new Date(video.added_at);

      expiry.setDate(expiry.getDate() + video.video_expire_days);
      return expiry >= now;
    });

    // console.log("filteredVideos", filteredVideos);

    return res.send(successResponse(filteredVideos));
  });
});

// router.use(checkAdminRole);

// GET: get all videos (admin) with optional courseId filter
router.get("/all-videos", (req, res) => {
  const { courseId } = req.query;

  let sql = `SELECT * FROM ${VIDEO_TABLE}`;
  const params = [];

  if (courseId) {
    sql += " WHERE course_id = ?";
    params.push(courseId);
  }

  pool.query(sql, params, (error, results) => {
    if (error) return res.send(errorResponse(error));

    if (results.length === 0)
      return res.send(successResponse(`No videos found.`));

    return res.send(successResponse(results));
  });
});

// POST: add new video to a course
router.post("/add", (request, response) => {
  const { courseId, title, description, youtubeURL } = request.body;

  // 1. check if course exists with given courseId
  const sqlCourse = `SELECT * FROM ${COURSE_TABLE} WHERE course_id = ?`;

  pool.query(sqlCourse, [courseId], (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.length === 0)
      return response.send(
        successResponse(`No course found with Id: ${courseId}`)
      );

    // 2. If course exists, then add the video into the db
    const insertVideoSQL = `INSERT INTO ${VIDEO_TABLE} 
        (course_id, title, youtube_url, description)
        VALUES (?, ?, ?, ?)`;

    pool.query(
      insertVideoSQL,
      [courseId, title, youtubeURL, description],
      (error, insertResponse) => {
        if (error) return response.send(errorResponse(error));

        if (insertResponse.affectedRows === 0)
          return response.send(errorResponse("something went wrong"));

        return response.send(successResponse(`Video added successfully.`));
      }
    );
  });
});

// PUT: update a video of a course by videoId
router.put("/update/:videoId", (request, response) => {
  const { videoId } = request.params;
  const { courseId, title, description, youtubeURL } = request.body;

  // 1. check if course exists with given courseId
  const sqlCourse = `SELECT * FROM ${COURSE_TABLE} WHERE course_id = ?`;

  pool.query(sqlCourse, [courseId], (error, results) => {
    if (error) return response.send(errorResponse(error));

    if (results.length === 0)
      return response.send(
        successResponse(`No course found with Id: ${courseId}`)
      );

    // 2. If course exists, then update the video details
    const updateVideoSQL = `UPDATE ${VIDEO_TABLE} 
        SET course_id = ?, title = ?, youtube_url = ?, description = ?
        WHERE video_id = ?`;

    pool.query(
      updateVideoSQL,
      [courseId, title, youtubeURL, description, videoId],
      (error, updateResponse) => {
        if (error) return response.send(errorResponse(error));

        if (updateResponse.affectedRows === 0)
          return response.send(
            errorResponse(`No video found with Id: ${videoId}`)
          );

        return response.send(successResponse(`Video updated successfully.`));
      }
    );
  });
});

// DELETE: delete a video of a course by videoId
router.delete("/delete/:videoId", (request, response) => {
  const { videoId } = request.params;

  // delete the video by videoId
  const deleteVideoSQL = `DELETE FROM ${VIDEO_TABLE} WHERE video_id = ?`;

  pool.query(deleteVideoSQL, [videoId], (error, deleteResponse) => {
    if (error) return response.send(errorResponse(error));

    if (deleteResponse.affectedRows === 0)
      return response.send(errorResponse(`No video found with Id: ${videoId}`));

    return response.send(successResponse(`Video deleted successfully.`));
  });
});

module.exports = router;

// CHECK
// other way
// // GET: get all videos of a course registered by a student
// router.get("/student/:email/:courseId", (req, res) => {
//   const { email, courseId } = req.params;

//   // Current date/time
//   const now = new Date();

//   // SQL: check if student is registered for the course and video is not expired
//   const sql = `
//     SELECT v.*
//     FROM ${VIDEO_TABLE} v
//     INNER JOIN ${STUDENTS_TABLE} s ON s.course_id = v.course_id
//     WHERE s.email = ?
//       AND s.course_id = ?
//       AND DATE_ADD(v.added_at, INTERVAL v.video_expire_days DAY) >= NOW()
//   `;

//   pool.query(sql, [email, courseId], (error, results) => {
//     if (error) return res.send(errorResponse(error));

//     if (results.length === 0)
//       return res.send(successResponse(`No videos available for this course`));

//     return res.send(successResponse(results));
//   });
// });
