import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchActiveCourses, fetchMyCourses } from "../services/courseServices";
import { registerStudentToCourse } from "../services/studentServices";
import {
  fetchVideosForStudent,
  fetchAllVideosAdmin,
} from "../services/videoServices";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    mobileNo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [videosByCourse, setVideosByCourse] = useState({});
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [myCoursesLoading, setMyCoursesLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!token;
  const isAdmin =
    (userRole && userRole.toLowerCase() === "admin") ||
    (userEmail && userEmail.toLowerCase() === "admin@example.com");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await fetchActiveCourses();
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data);
        } else {
          toast.error(result.message || "Failed to load courses");
        }
      } catch (error) {
        console.error("Error loading courses", error);
        toast.error("Failed to load courses from server");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      const loadMyCourses = async () => {
        try {
          setMyCoursesLoading(true);
          const result = await fetchMyCourses();
          if (result.success && Array.isArray(result.data)) {
            setMyCourses(result.data);
          } else {
            setMyCourses([]);
            toast.error(result.message || "Failed to load your courses");
          }
        } catch (error) {
          console.error("Error loading my courses", error);
          setMyCourses([]);
          toast.error("Failed to load your courses");
        } finally {
          setMyCoursesLoading(false);
        }
      };
      loadMyCourses();
    } else {
      setMyCourses([]);
    }
  }, [isLoggedIn, isAdmin]);

  const openRegisterModal = (course) => {
    setSelectedCourse(course);
    setRegForm({
      name: "",
      email: "",
      mobileNo: "",
    });
  };

  const closeRegisterModal = () => {
    setSelectedCourse(null);
    setSubmitting(false);
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSubmitting(true);
    try {
      const payload = {
        name: regForm.name,
        email: regForm.email,
        courseId: selectedCourse.course_id,
        mobileNo: regForm.mobileNo,
      };
      const result = await registerStudentToCourse(payload);
      if (result.success) {
        toast.success(result.message || "Registration successful");
        closeRegisterModal();
      } else {
        toast.error(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error", error);
      toast.error("Failed to register for course");
    } finally {
      setSubmitting(false);
    }
  };

  const loadVideosForCourse = async (course) => {
    if (!isLoggedIn) {
      toast.info("Login and register to view course videos.");
      return;
    }

    if (!userEmail) {
      toast.error("User email not found. Please login again.");
      return;
    }

    setActiveCourseId(course.course_id);
    setVideosByCourse((prev) => ({
      ...prev,
      [course.course_id]: {
        ...(prev[course.course_id] || {}),
        loading: true,
        error: null,
      },
    }));

    try {
      const result = isAdmin
        ? await fetchAllVideosAdmin({ courseId: course.course_id })
        : await fetchVideosForStudent({
            email: userEmail,
            courseId: course.course_id,
            token,
          });

      if (result.success && Array.isArray(result.data)) {
        setVideosByCourse((prev) => ({
          ...prev,
          [course.course_id]: {
            loading: false,
            videos: result.data,
            error:
              result.data.length === 0
                ? "No videos found. If you have just registered, wait for admin to add videos."
                : null,
          },
        }));
      } else {
        setVideosByCourse((prev) => ({
          ...prev,
          [course.course_id]: {
            loading: false,
            videos: [],
            error:
              result?.message ||
              (isAdmin
                ? "No videos available for this course."
                : "No videos available. Make sure you are registered for this course."),
          },
        }));
      }
    } catch (error) {
      console.error("Error loading videos", error);
      setVideosByCourse((prev) => ({
        ...prev,
        [course.course_id]: {
          loading: false,
          videos: [],
          error: "Failed to load videos. Please try again.",
        },
      }));
      toast.error("Failed to load videos for this course");
    }
  };

  const getVideoState = (courseId) =>
    videosByCourse[courseId] || { loading: false, videos: [], error: null };

  return (
    <div className="mt-5 pt-4">
      {/* Hero section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1 className="display-5 fw-bold text-info">
                Welcome to Sunbeam Online Course Portal
              </h1>
              <p className="lead mt-3">
                Register for industry‑oriented courses, manage your learning,
                and watch high‑quality video lectures from anywhere.
              </p>
              {!isLoggedIn && (
                <p className="mt-3">
                  <strong>Tip:</strong> Login as{" "}
                  <code>admin@example.com</code> / <code>admin123</code> to see
                  the admin module.
                </p>
              )}
            </div>
            <div className="col-md-5 text-md-end mt-4 mt-md-0">
              <img
                src="https://dummyimage.com/420x260/0dcaf0/ffffff&text=Sunbeam+Courses"
                alt="Sunbeam Courses"
                className="img-fluid rounded shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Available Courses */}
      <section id="courses" className="py-4 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h3 mb-0">Available Courses</h2>
            <span className="text-muted small">
              Browse and register for upcoming batches
            </span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="alert alert-info mb-0">
              No active courses found. Please check back later.
            </div>
          ) : (
            <div className="row g-4">
              {courses.map((course) => (
                <div key={course.course_id} className="col-md-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-info">
                        {course.course_name}
                      </h5>
                      <p className="card-text flex-grow-1">
                        {course.description}
                      </p>
                      <ul className="list-unstyled small mb-3">
                        <li>
                          <strong>Fees:</strong> ₹
                          {Number(course.fees || 0).toLocaleString()}
                        </li>
                        <li>
                          <strong>Start:</strong> {course.start_date}
                        </li>
                        <li>
                          <strong>End:</strong> {course.end_date}
                        </li>
                      </ul>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex justify-content-between gap-2">
                          <button
                            className="btn btn-info btn-sm text-white flex-fill"
                            onClick={() => openRegisterModal(course)}
                          >
                            Register
                          </button>
                          <button
                            className="btn btn-outline-info btn-sm flex-fill"
                            disabled={!isLoggedIn}
                            onClick={() => loadVideosForCourse(course)}
                            title={
                              isLoggedIn
                                ? "View course videos (requires registration)"
                                : "Login to view course videos"
                            }
                          >
                            {isLoggedIn ? "View Videos" : "Login to View Videos"}
                          </button>
                        </div>
                        {activeCourseId === course.course_id && (
                          <div className="mt-2 border-top pt-2">
                            {getVideoState(course.course_id).loading ? (
                              <div className="text-center py-2">
                                <div
                                  className="spinner-border text-info spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              </div>
                            ) : getVideoState(course.course_id).error ? (
                              <div className="alert alert-warning mb-0 small">
                                {getVideoState(course.course_id).error}
                              </div>
                            ) : getVideoState(course.course_id).videos.length ===
                              0 ? (
                              <div className="alert alert-info mb-0 small">
                                No videos yet. Register and login to unlock when
                                available.
                              </div>
                            ) : (
                              <div className="list-group small">
                                {getVideoState(
                                  course.course_id,
                                ).videos.map((video) => (
                                  <div
                                    className="list-group-item d-flex align-items-start justify-content-between"
                                    key={video.video_id}
                                  >
                                    <div className="me-2">
                                      <div className="fw-semibold">
                                        {video.title}
                                      </div>
                                      <div className="text-muted">
                                        {video.description || "No description"}
                                      </div>
                                    </div>
                                    <button
                                      className="btn btn-sm btn-info text-white"
                                      onClick={() =>
                                        window.open(video.youtube_url, "_blank")
                                      }
                                      disabled={!isLoggedIn}
                                      title={
                                        isLoggedIn
                                          ? "Play video"
                                          : "Login and register to play"
                                      }
                                    >
                                      Play
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {!isLoggedIn && (
                          <div className="alert alert-light border small mb-0">
                            Courses are public. Login and register to unlock
                            videos.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enrolled Courses for logged‑in students */}
      {isLoggedIn && !isAdmin && (
        <section className="py-4">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Your Enrolled Courses</h2>
              <span className="text-muted small">Signed in as {userEmail}</span>
            </div>
            {myCoursesLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : myCourses.length === 0 ? (
              <div className="alert alert-info">
                You are not registered for any course yet. Register from the
                list above.
              </div>
            ) : (
              <div className="row g-3">
                {myCourses.map((course) => (
                  <div key={course.course_id} className="col-md-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <h6 className="text-info mb-1">{course.course_name}</h6>
                        <p className="text-muted small flex-grow-1 mb-2">
                          {course.description || "No description"}
                        </p>
                        <div className="small mb-2">
                          <div>
                            <strong>Start:</strong> {course.start_date}
                          </div>
                          <div>
                            <strong>End:</strong> {course.end_date}
                          </div>
                        </div>
                        <button
                          className="btn btn-outline-info btn-sm mt-auto"
                          onClick={() => loadVideosForCourse(course)}
                        >
                          View Videos
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Admin overview */}
      {isLoggedIn && isAdmin && (
        <section className="py-4">
          <div className="container">
            <h2 className="h4 mb-3">Admin Dashboard Overview</h2>
            <p className="text-muted">
              Use the <strong>Admin</strong> menu in the navbar to manage
              courses, videos, and view registered students per course.
            </p>
          </div>
        </section>
      )}

      {/* Registration modal */}
      {selectedCourse && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Register for {selectedCourse.course_name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeRegisterModal}
                    aria-label="Close"
                  ></button>
                </div>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={regForm.name}
                        onChange={handleRegChange}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={regForm.email}
                        onChange={handleRegChange}
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobileNo"
                        className="form-control"
                        value={regForm.mobileNo}
                        onChange={handleRegChange}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Course</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedCourse.course_name}
                        disabled
                      />
                    </div>
                    <div className="alert alert-info small mb-0">
                      After registration, a user will be created with this email
                      and default password <strong>sunbeam</strong>. The student
                      can change the password later.
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeRegisterModal}
                      disabled={submitting}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-info text-white"
                      disabled={submitting}
                    >
                      {submitting ? "Registering..." : "Register"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Home;
