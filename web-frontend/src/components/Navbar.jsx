import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!token;
  const isAdmin =
    (userRole && userRole.toLowerCase() === "admin") ||
    (userEmail && userEmail.toLowerCase() === "admin@example.com");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <nav
      className="navbar bg-info navbar-expand-lg fixed-top"
      data-bs-theme="dark"
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left: Brand with logo + app name */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 ms-2">
          <span
            className="bg-light text-info fw-bold rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36 }}
          >
            S
          </span>
          <span className="fs-5 fw-bold">
            Sunbeam Online Course Portal
          </span>
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Center: Links + Search */}
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mb-2 mb-lg-0 text-center me-3">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link link-color ${
                  location.pathname === "/" || location.pathname === "/home"
                    ? "active"
                    : ""
                }`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/about"
                className={`nav-link link-color ${
                  location.pathname === "/about" ? "active" : ""
                }`}
              >
                About Sunbeam
              </Link>
            </li>
            <li className="nav-item">
              {isAdmin ? (
                <Link
                  to="/admin/registered-courses"
                  className={`nav-link link-color ${
                    location.pathname === "/admin/registered-courses"
                      ? "active"
                      : ""
                  }`}
                >
                  Courses
                </Link>
              ) : isLoggedIn ? (
                <Link
                  to="/courses"
                  className={`nav-link link-color ${
                    location.pathname === "/courses" ? "active" : ""
                  }`}
                >
                  Courses
                </Link>
              ) : (
                <a href="#courses" className="nav-link link-color">
                  Courses
                </a>
              )}
            </li>

            {/* Admin menu (visible only for admin user) */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle link-color btn btn-link border-0 p-0"
                  id="adminDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  type="button"
                >
                  Admin
                </button>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li>
                    <Link
                      to="/admin/courses"
                      className={`dropdown-item ${
                        location.pathname === "/admin/courses" ? "active" : ""
                      }`}
                    >
                      Manage Courses
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/videos"
                      className={`dropdown-item ${
                        location.pathname === "/admin/videos" ? "active" : ""
                      }`}
                    >
                      Manage Videos
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/students"
                      className={`dropdown-item ${
                        location.pathname === "/admin/students" ? "active" : ""
                      }`}
                    >
                      Student List
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* Search bar */}
          <form className="d-flex mb-2 mb-lg-0" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search courses"
              aria-label="Search"
            />
            <button className="btn btn-outline-light" type="submit">
              Search
            </button>
          </form>
        </div>

        {/* Right: Auth actions */}
        <div className="d-flex align-items-center ms-2">
          {isLoggedIn ? (
            <>
              <span className="text-white me-3 d-none d-md-inline user-label">
                {isAdmin ? "Admin" : "Student"} &mdash; {userEmail}
              </span>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline-light">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
