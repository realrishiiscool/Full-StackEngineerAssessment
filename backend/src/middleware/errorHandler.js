/**
 * Global error handling middleware.
 * Returns consistent JSON error responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    const details = (err.errors || []).map((e) => ({ field: e.path, message: e.message }));
    return res.status(409).json({
      success: false,
      error: { message: 'A record with one of these unique values already exists.', details },
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details,
      },
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Foreign key constraint error',
        details: 'Referenced record does not exist.',
      },
    });
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Database error',
        details: err.message,
      },
    });
  }

  // Custom application errors (thrown with statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || null,
      },
    });
  }

  // express-validator errors forwarded as an error object
  if (err.validationErrors) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        details: err.validationErrors,
      },
    });
  }

  // Default 500 Internal Server Error
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : null,
    },
  });
};

module.exports = errorHandler;
