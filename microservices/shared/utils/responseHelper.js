/**
 * Standard API success response
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

/**
 * Standard API error response
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, details = null) =>
  res.status(statusCode).json({ success: false, message, ...(details && { details }) });

/**
 * Paginated response helper
 */
const sendPaginated = (res, data, total, page, limit, message = 'Success') =>
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  });

module.exports = { sendSuccess, sendError, sendPaginated };
