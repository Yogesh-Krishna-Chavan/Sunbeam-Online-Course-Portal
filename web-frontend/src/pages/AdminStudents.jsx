import React, { useMemo, useState } from "react";

const mockCourses = [
  { course_id: 1, course_name: "Full Stack Python" },
  { course_id: 2, course_name: "MERN Stack" },
];

const mockStudents = [
  {
    id: 1,
    name: "Rahul Patil",
    email: "rahul@example.com",
    mobile_no: "9876543210",
    course_id: 1,
    registered_on: "2025-01-05",
  },
  {
    id: 2,
    name: "Anita Sharma",
    email: "anita@example.com",
    mobile_no: "9876512345",
    course_id: 1,
    registered_on: "2025-01-10",
  },
  {
    id: 3,
    name: "Rohan Desai",
    email: "rohan@example.com",
    mobile_no: "9876509876",
    course_id: 2,
    registered_on: "2025-02-02",
  },
];

const AdminStudents = () => {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("registered_on");
  const [sortDir, setSortDir] = useState("asc");

  const getCourseName = (id) =>
    mockCourses.find((c) => c.course_id === id)?.course_name || `#${id}`;

  const filteredStudents = useMemo(() => {
    let data = [...mockStudents];

    if (selectedCourseId) {
      data = data.filter(
        (s) => String(s.course_id) === String(selectedCourseId),
      );
    }

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          d.email.toLowerCase().includes(s) ||
          d.mobile_no.includes(s),
      );
    }

    data.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [selectedCourseId, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? "▲" : "▼";
  };

  return (
    <div className="container mt-5 pt-4">
      <section className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="h3 text-info mb-0">Admin – Registered Students</h1>
          <span className="text-muted small">
            View and filter students registered per course
          </span>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Course</label>
                <select
                  className="form-select"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  <option value="">All courses</option>
                  {mockCourses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email or mobile"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Sort By</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                  >
                    <option value="registered_on">Registration date</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
                    }
                  >
                    {sortDir === "asc" ? "Asc" : "Desc"}
                  </button>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th onClick={() => handleSort("name")}>
                      Name {sortIndicator("name")}
                    </th>
                    <th onClick={() => handleSort("email")}>
                      Email {sortIndicator("email")}
                    </th>
                    <th>Mobile</th>
                    <th>Course</th>
                    <th onClick={() => handleSort("registered_on")}>
                      Registered On {sortIndicator("registered_on")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.mobile_no}</td>
                      <td>{getCourseName(s.course_id)}</td>
                      <td>{s.registered_on}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-3">
                        No students found for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminStudents;



