// to be implemented.
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config");
const { errorResponse } = require("../utils/apiResponse");

const checkAuthentication = (request, response, next) => {
  const skipUrls = [
    "/auth/login",
    "/student/register-to-course",
    "/course/all-active-courses",
  ];

  if (skipUrls.includes(request.url)) return next();

  const token = request.headers.token;

  if (!token) return response.send(errorResponse("Token if required!"));

  try {
    const payload = jwt.verify(token, JWT_SECRET_KEY);

    request.user = {
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (error) {
    console.log("error", error);
    return response.send(errorResponse("Invalid or expired token!"));
  }
};

const checkAuthorization = (request, response, next) => {
  if (request.user.role === "admin") {
    return next();
  }

  return response.send(errorResponse("UnAuthorized Access!"));
};

module.exports = {
  checkAuthentication,
  checkAuthorization,
};
