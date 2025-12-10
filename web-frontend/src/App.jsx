import React from "react";
import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import StudentCourses from "./pages/StudentCourses";
import AdminCourses from "./pages/AdminCourses";
import AdminVideos from "./pages/AdminVideos";
import AdminStudents from "./pages/AdminStudents";
import RegisteredCourses from "./pages/RegisteredCourses";

const App = () => {
  return (
    <div className="container py-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        {/* Student routes */}
        <Route path="/courses" element={<StudentCourses />} />
        {/* Admin routes */}
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/videos" element={<AdminVideos />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route
          path="/admin/registered-courses"
          element={<RegisteredCourses />}
        />
      </Routes>
    </div>
  );
};

export default App;
