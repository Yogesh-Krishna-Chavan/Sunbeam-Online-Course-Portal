import axios from "axios";
import { BASE_URL } from "./config";

// Fetch videos for a student for a given course.
// Requires the student's email (to match registration) and optional auth token.
export async function fetchVideosForStudent({ email, courseId, token }) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await axios.get(
    `${BASE_URL}/videos/all/${encodeURIComponent(email)}/${courseId}`,
    { headers },
  );
  return response.data;
}

// ----- Admin video APIs -----

export async function fetchAllVideosAdmin({ courseId } = {}) {
  const token = localStorage.getItem("token");
  const params = {};
  if (courseId) params.courseId = courseId;

  const response = await axios.get(`${BASE_URL}/videos/all-videos`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
}

export async function addVideoAdmin(video) {
  const token = localStorage.getItem("token");
  const payload = {
    courseId: video.course_id,
    title: video.title,
    description: video.description,
    youtubeURL: video.youtube_url,
  };

  const response = await axios.post(`${BASE_URL}/videos/add`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateVideoAdmin(video) {
  const token = localStorage.getItem("token");
  const payload = {
    courseId: video.course_id,
    title: video.title,
    description: video.description,
    youtubeURL: video.youtube_url,
  };

  const response = await axios.put(
    `${BASE_URL}/videos/update/${video.video_id}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function deleteVideoAdmin(videoId) {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${BASE_URL}/videos/delete/${videoId}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

