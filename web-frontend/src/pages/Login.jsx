import React, { useState } from "react";
import { userLogin } from "../services/authServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await userLogin({ email, password });
      console.log(result);

      // Flask returns { success: true/false, message: "...", data: {...} }
      if (!result || result.success === false) {
        throw new Error(result?.message || "Login failed");
      }

      // if login success,
      if (result.success && result.data?.token) {
        // Store token and email in localStorage for future requests / role checks
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("userEmail", email);
        if (result.data.role) {
          localStorage.setItem("userRole", result.data.role);
        } else {
          localStorage.removeItem("userRole");
        }
        toast.success(result.message || "Login successful!");
        navigate("/");
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Something went wrong!");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-80 bg-light mt-5">
      <div className="card shadow p-4" style={{ width: "550px" }}>
        <h3 className="text-center mb-4">Login</h3>

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="text"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-info text-white w-50">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
