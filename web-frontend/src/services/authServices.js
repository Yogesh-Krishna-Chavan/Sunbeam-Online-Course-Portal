import axios from "axios";
import { BASE_URL } from "./config";

export async function userLogin({ email, password }) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log("error", error);
    // Return error in Flask format
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
}
