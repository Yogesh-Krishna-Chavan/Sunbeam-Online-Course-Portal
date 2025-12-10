const successResponse = (data) => {
  return {
    status: "success",
    data,
  };
};

const errorResponse = (error) => {
  return {
    status: "error",
    error,
  };
};

module.exports = {
  successResponse,
  errorResponse,
};
