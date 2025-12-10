import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchMyCourses } from "../services/courseServices";
import { fetchVideosForStudent, fetchAllVideosAdmin } from "../services/videoServices";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosByCourse, setVideosByCourse] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!token;
  const isAdmin =
    (userRole && userRole.toLowerCase() === "admin") ||
    (userEmail && userEmail.toLowerCase() === "admin@example.com");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to view your enrolled courses");
      return;
    }
    loadMyCourses();
  }, [isLoggedIn]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const result = await fetchMyCourses();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
      } else {
        toast.error(result.message || "Failed to load enrolled courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Error loading enrolled courses:", error);
      toast.error("Failed to load enrolled courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVideos = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }

    setExpandedCourse(courseId);
    setVideosByCourse((prev) => ({
      ...prev,
      [courseId]: { loading: true, videos: [], error: null },
    }));

    try {
      let result;
      if (isAdmin) {
        result = await fetchAllVideosAdmin({ courseId });
      } else {
        result = await fetchVideosForStudent({
          email: userEmail,
          courseId: courseId,
          token: token,
        });
      }

      if (result.success && Array.isArray(result.data)) {
        setVideosByCourse((prev) => ({
          ...prev,
          [courseId]: {
            loading: false,
            videos: result.data,
            error: result.data.length === 0 ? "No videos available for this course." : null,
          },
        }));
      } else {
        setVideosByCourse((prev) => ({
          ...prev,
          [courseId]: {
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
      console.error("Error loading videos:", error);
      setVideosByCourse((prev) => ({
        ...prev,
        [courseId]: {
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

  if (!isLoggedIn) {
    return (
      <div className="container mt-5 pt-4">
        <div className="alert alert-warning">
          Please <a href="/login">login</a> to view your enrolled courses.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-4">
      <section className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 text-info mb-0">My Enrolled Courses</h1>
          <span className="text-muted small">
            View courses you've registered for and access video lectures
          </span>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="alert alert-info">
            <h5 className="alert-heading">No Enrolled Courses</h5>
            <p className="mb-0">
              You haven't enrolled in any courses yet. Visit the{" "}
              <a href="/">Home page</a> to browse and register for available
              courses.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {courses.map((course) => {
              const videoState = getVideoState(course.course_id);
              const isExpanded = expandedCourse === course.course_id;

              return (
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
                          {Number(course.fees || 0).toLocaleString()}
                        </li>
                        <li>
                          <strong>Start Date:</strong> {course.start_date}
                        </li>
                        <li>
                          <strong>End Date:</strong> {course.end_date}
                        </li>
                        {course.video_expire_days && (
                          <li>
                            <strong>Video Expire Days:</strong>{" "}
                            {course.video_expire_days}
                          </li>
                        )}
                      </ul>
                      <div className="mt-auto">
                        <button
                          className="btn btn-info btn-sm text-white w-100 mb-2"
                          onClick={() => handleViewVideos(course.course_id)}
                          disabled={videoState.loading}
                        >
                          {videoState.loading
                            ? "Loading..."
                            : isExpanded
                              ? "Hide Videos"
                              : "View Videos"}
                        </button>

                        {isExpanded && (
                          <div className="mt-3">
                            {videoState.loading ? (
                              <div className="text-center py-2">
                                <div
                                  className="spinner-border spinner-border-sm text-info"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Loading...
                                  </span>
                                </div>
                              </div>
                            ) : videoState.error ? (
                              <div className="alert alert-warning small mb-0">
                                {videoState.error}
                              </div>
                            ) : videoState.videos.length === 0 ? (
                              <div className="alert alert-info small mb-0">
                                No videos available for this course.
                              </div>
                            ) : (
                              <div className="list-group list-group-flush">
                                {videoState.videos.map((video) => (
                                  <div
                                    key={video.video_id}
                                    className="list-group-item px-0 py-2"
                                  >
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1 small fw-semibold">
                                          {video.title}
                                        </h6>
                                        {video.description && (
                                          <p className="mb-1 small text-muted">
                                            {video.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={video.youtube_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-sm btn-outline-info mt-2"
                                    >
                                      ▶ Play Video
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentCourses;

