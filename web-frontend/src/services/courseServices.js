import axios from "axios";
import { BASE_URL } from "./config";

// Fetch all active courses (public endpoint)
export async function fetchActiveCourses() {
  const response = await axios.get(`${BASE_URL}/courses/all-active-courses`);
  return response.data;
}

// ----- Admin course APIs -----

// Get all courses (admin only, optional start/end filters)
export async function fetchAllCoursesAdmin({ startDate, endDate } = {}) {
  const token = localStorage.getItem("token");
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axios.get(`${BASE_URL}/courses/all-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
}

export async function addCourseAdmin(course) {
  const token = localStorage.getItem("token");
  const payload = {
    courseName: course.course_name,
    description: course.description,
    fees: course.fees,
    startDate: course.start_date,
    endDate: course.end_date,
    videoExpireDays: course.video_expire_days,
  };

  const response = await axios.post(`${BASE_URL}/courses/add`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateCourseAdmin(course) {
  const token = localStorage.getItem("token");
  const payload = {
    courseName: course.course_name,
    description: course.description,
    fees: course.fees,
    startDate: course.start_date,
    endDate: course.end_date,
    videoExpireDays: course.video_expire_days,
  };

  const response = await axios.put(
    `${BASE_URL}/courses/update/${course.course_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function deleteCourseAdmin(courseId) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${BASE_URL}/courses/delete/${courseId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

// Get courses with student registrations (admin only)
export async function fetchRegisteredCoursesAdmin() {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/courses/registered-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Get courses registered for the logged-in student
export async function fetchMyCourses() {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${BASE_URL}/courses/my-courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
