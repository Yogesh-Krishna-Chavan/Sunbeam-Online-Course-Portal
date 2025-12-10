import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAllCoursesAdmin,
  addCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
} from "../services/courseServices";

const emptyForm = {
  course_id: "",
  course_name: "",
  description: "",
  fees: "",
  start_date: "",
  end_date: "",
  video_expire_days: "",
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const result = await fetchAllCoursesAdmin();
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

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (course) => {
    setEditingId(course.course_id);
    setForm({
      course_id: course.course_id,
      course_name: course.course_name,
      description: course.description,
      fees: course.fees,
      start_date: course.start_date,
      end_date: course.end_date,
      video_expire_days: course.video_expire_days,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const result = await deleteCourseAdmin(id);
      if (result.success) {
        toast.success(result.message || "Course deleted successfully");
        await loadCourses();
        if (editingId === id) {
          setEditingId(null);
          setForm(emptyForm);
        }
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete course error", error);
      toast.error("Failed to delete course");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = {
      ...form,
      course_id: Number(form.course_id || Date.now()),
      fees: Number(form.fees || 0),
      video_expire_days: Number(form.video_expire_days || 0),
    };

    try {
      if (editingId) {
        const payload = { ...parsed, course_id: editingId };
        const result = await updateCourseAdmin(payload);
        if (result.success) {
          toast.success(result.message || "Course updated successfully");
        } else {
          toast.error(result.message || "Failed to update course");
          return;
        }
      } else {
        const result = await addCourseAdmin(parsed);
        if (result.success) {
          toast.success(result.message || "Course added successfully");
        } else {
          toast.error(result.message || "Failed to add course");
          return;
        }
      }
      await loadCourses();
      setEditingId(null);
      setForm(emptyForm);
    } catch (error) {
      console.error("Save course error", error);
      toast.error("Failed to save course");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="container mt-5 pt-4">
      <section className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 text-info mb-0">Admin – Manage Courses</h1>
          <span className="text-muted small">
            Add, edit, and delete Sunbeam courses
          </span>
        </div>

        <div className="row g-4">
          {/* Course list */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Courses</span>
                <span className="badge text-bg-info">
                  {courses.length} total
                </span>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Name &amp; Description</th>
                          <th>Fees</th>
                          <th>Dates</th>
                          <th>Videos Expire (days)</th>
                          <th style={{ width: 120 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course) => (
                          <tr key={course.course_id}>
                            <td>{course.course_id}</td>
                            <td>
                              <div className="fw-semibold">
                                {course.course_name}
                              </div>
                              {course.description && (
                                <div
                                  className="text-muted small text-truncate"
                                  style={{ maxWidth: "260px" }}
                                >
                                  {course.description}
                                </div>
                              )}
                            </td>
                            <td>
                              ₹{Number(course.fees || 0).toLocaleString()}
                            </td>
                            <td>
                              <small>
                                {course.start_date} &rarr; {course.end_date}
                              </small>
                            </td>
                            <td>{course.video_expire_days}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-info"
                                  onClick={() => handleEdit(course)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() =>
                                    handleDelete(course.course_id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {courses.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-3">
                              No courses added yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course form */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header">
                <span className="fw-semibold">
                  {editingId ? "Edit Course" : "Add New Course"}
                </span>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="form-label">Course ID (optional)</label>
                    <input
                      type="number"
                      name="course_id"
                      className="form-control"
                      value={form.course_id}
                      onChange={handleChange}
                      placeholder="Auto-generated if left blank"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Course Name</label>
                    <input
                      type="text"
                      name="course_name"
                      className="form-control"
                      value={form.course_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows={2}
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Fees (₹)</label>
                      <input
                        type="number"
                        name="fees"
                        className="form-control"
                        value={form.fees}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">Video Expire Days</label>
                      <input
                        type="number"
                        name="video_expire_days"
                        className="form-control"
                        value={form.video_expire_days}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        className="form-control"
                        value={form.start_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-6 mb-2">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        className="form-control"
                        value={form.end_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-info btn-sm text-white"
                    >
                      {editingId ? "Update Course" : "Add Course"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminCourses;


