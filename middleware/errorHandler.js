// Error Handling Middleware
const errorHandler = (error, req, res, next) => {
  console.error(
    'Error: Status Code:', error.status, ' Message:', error.message,);
  const statusCode = error.status || 500;
  const message = error.message || 'Internal server error';
  return res.status(statusCode).send({
    status: statusCode,
    message: message,
  });
};

export { errorHandler };