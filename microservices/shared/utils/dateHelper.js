/**
 * Returns today's date as YYYY-MM-DD string
 */
const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Format a date object or string to YYYY-MM-DD
 */
const toDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Check if a given date string is today
 */
const isToday = (dateString) => dateString === getTodayString();

/**
 * Get the start of today (midnight) as a Date object
 */
const getStartOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the end of today (23:59:59) as a Date object
 */
const getEndOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = { getTodayString, toDateString, isToday, getStartOfToday, getEndOfToday };
