import axios from "axios";
import { BASE_URL } from "./config";

// Register a student to a course (public endpoint)
export async function registerStudentToCourse(payload) {
  const response = await axios.post(
    `${BASE_URL}/students/register-to-course`,
    payload,
  );
  return response.data;
}

// Get all registered students (admin only) - for getting courses with registrations
export async function fetchAllStudentsAdmin() {
  const token = localStorage.getItem("token");
  // Note: This endpoint doesn't exist yet in backend, but we'll use courses + students data
  // For now, we'll fetch courses and filter on frontend
  // TODO: Create backend endpoint to get courses with student counts
  return { success: true, data: [] };
}