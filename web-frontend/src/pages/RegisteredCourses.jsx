import React, { useEffect, useState } from "react";
import { fetchRegisteredCoursesAdmin } from "../services/courseServices";
import { toast } from "react-toastify";

const RegisteredCourses = () => {
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegisteredCourses();
  }, []);

  const loadRegisteredCourses = async () => {
    try {
      setLoading(true);
      const result = await fetchRegisteredCoursesAdmin();
      if (result.success && result.data) {
        setRegisteredCourses(result.data);
      } else {
        toast.error(result.message || "Failed to load registered courses");
        setRegisteredCourses([]);
      }
    } catch (error) {
      console.error("Error loading registered courses:", error);
      toast.error("Failed to load registered courses");
      setRegisteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4">
      <section className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 text-info mb-0">Registered Courses</h1>
          <span className="text-muted small">
            Courses with student registrations
          </span>
        </div>

        {registeredCourses.length === 0 ? (
          <div className="alert alert-info">
            No courses with registrations found. Students can register for
            courses from the Home page.
          </div>
        ) : (
          <div className="row g-4">
            {registeredCourses.map((course) => (
              <div key={course.course_id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-info">
                      {course.course_name}
                    </h5>
                    <p className="card-text flex-grow-1 text-muted small">
                      {course.description || "No description available"}
                    </p>
                    <ul className="list-unstyled small mb-3">
                      <li>
                        <strong>Course ID:</strong> {course.course_id}
                      </li>
                      <li>
                        <strong>Fees:</strong> ₹
                        {course.fees?.toLocaleString() || "N/A"}
                      </li>
                      <li>
                        <strong>Start Date:</strong> {course.start_date}
                      </li>
                      <li>
                        <strong>End Date:</strong> {course.end_date}
                      </li>
                      <li>
                        <strong>Video Expire Days:</strong>{" "}
                        {course.video_expire_days || "N/A"}
                      </li>
                      <li>
                        <strong className="text-success">
                          Registered Students:
                        </strong>{" "}
                        <span className="badge bg-success">
                          {course.student_count || 0}
                        </span>
                      </li>
                    </ul>
                    <div className="mt-auto">
                      <button
                        className="btn btn-info btn-sm text-white w-100"
                        onClick={() => {
                          // Navigate to student list filtered by this course
                          window.location.href = `/admin/students?courseId=${course.course_id}`;
                        }}
                      >
                        View Registered Students ({course.student_count || 0})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RegisteredCourses;

