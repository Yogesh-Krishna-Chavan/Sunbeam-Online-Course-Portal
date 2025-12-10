import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  fetchAllCoursesAdmin,
  fetchAllCoursesAdmin as fetchCoursesAdmin,
} from "../services/courseServices";
import {
  fetchAllVideosAdmin,
  addVideoAdmin,
  updateVideoAdmin,
  deleteVideoAdmin,
} from "../services/videoServices";

const emptyVideoForm = {
  video_id: "",
  course_id: "",
  title: "",
  youtube_url: "",
  description: "",
};

const AdminVideos = () => {
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyVideoForm);
  const [editingId, setEditingId] = useState(null);
  const [filterCourseId, setFilterCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // load courses and videos on mount
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCourses(), loadVideos()]);
    };
    init();
  }, []);

  const loadCourses = async () => {
    try {
      const result = await fetchCoursesAdmin();
      if (result.success && Array.isArray(result.data)) {
        setCourses(result.data);
      } else {
        toast.error(result.message || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses", error);
      toast.error("Failed to load courses");
    }
  };

  const loadVideos = async (courseId) => {
    try {
      setLoading(true);
      const result = await fetchAllVideosAdmin({ courseId });
      if (result.success && Array.isArray(result.data)) {
        setVideos(result.data);
      } else {
        toast.error(result.message || "Failed to load videos");
        setVideos([]);
      }
    } catch (error) {
      console.error("Error loading videos", error);
      toast.error("Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    return filterCourseId
      ? videos.filter((v) => String(v.course_id) === String(filterCourseId))
      : videos;
  }, [videos, filterCourseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (video) => {
    setEditingId(video.video_id);
    setForm({
      video_id: video.video_id,
      course_id: video.course_id,
      title: video.title,
      youtube_url: video.youtube_url,
      description: video.description,
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    deleteVideoAdmin(id)
      .then((result) => {
        if (result.success) {
          toast.success(result.message || "Video deleted");
          loadVideos(filterCourseId || undefined);
          if (editingId === id) {
            setEditingId(null);
            setForm(emptyVideoForm);
          }
        } else {
          toast.error(result.message || "Failed to delete video");
        }
      })
      .catch((error) => {
        console.error("Delete video error", error);
        toast.error("Failed to delete video");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = {
      ...form,
      course_id: Number(form.course_id),
    };

    if (!parsed.course_id) {
      alert("Please select a course.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const result = await updateVideoAdmin({
          ...parsed,
          video_id: editingId,
        });
        if (result.success) {
          toast.success(result.message || "Video updated");
        } else {
          toast.error(result.message || "Failed to update video");
          return;
        }
      } else {
        const result = await addVideoAdmin(parsed);
        if (result.success) {
          toast.success(result.message || "Video added");
        } else {
          toast.error(result.message || "Failed to add video");
          return;
        }
      }
      await loadVideos(filterCourseId || undefined);
      setEditingId(null);
      setForm(emptyVideoForm);
    } catch (error) {
      console.error("Save video error", error);
      toast.error("Failed to save video");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyVideoForm);
  };

  const getCourseName = (id) =>
    courses.find((c) => c.course_id === id)?.course_name || `#${id}`;

  const handleFilterChange = async (value) => {
    setFilterCourseId(value);
    await loadVideos(value || undefined);
  };

  return (
    <div className="container mt-5 pt-4">
      <section className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 text-info mb-0">Admin – Manage Videos</h1>
          <span className="text-muted small">
            Attach videos to courses and maintain content library
          </span>
        </div>

        <div className="row g-4">
          {/* Video list */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Videos</span>
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    value={filterCourseId}
                    onChange={(e) => handleFilterChange(e.target.value)}
                  >
                    <option value="">All courses</option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_name}
                      </option>
                    ))}
                  </select>
                </div>
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
                          <th>Course</th>
                          <th>Title</th>
                          <th>Link</th>
                          <th style={{ width: 120 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVideos.map((video) => (
                          <tr key={video.video_id}>
                            <td>{video.video_id}</td>
                            <td>{getCourseName(video.course_id)}</td>
                            <td>{video.title}</td>
                            <td>
                              <a
                                href={video.youtube_url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                View
                              </a>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  type="button"
                                  className="btn btn-outline-info"
                                  onClick={() => handleEdit(video)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(video.video_id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredVideos.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-3">
                              No videos found for selected filter.
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

          {/* Video form */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-header">
                <span className="fw-semibold">
                  {editingId ? "Edit Video" : "Add New Video"}
                </span>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="form-label">Video ID (optional)</label>
                    <input
                      type="number"
                      name="video_id"
                      className="form-control"
                      value={form.video_id}
                      onChange={handleChange}
                      placeholder="Auto-generated if left blank"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Course</label>
                    <select
                      name="course_id"
                      className="form-select"
                      value={form.course_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select course</option>
                  {courses.map((c) => (
                        <option key={c.course_id} value={c.course_id}>
                          {c.course_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">YouTube URL</label>
                    <input
                      type="url"
                      name="youtube_url"
                      className="form-control"
                      value={form.youtube_url}
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
                    disabled={saving}
                    >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Video"
                        : "Add Video"}
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

export default AdminVideos;


