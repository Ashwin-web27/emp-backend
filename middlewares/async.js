/**
 * Wrapper for async middleware to handle errors without try-catch blocks
 * @param {Function} fn Async function to wrap
 * @returns {Function} Wrapped middleware function
 */
const asyncHandler = fn => (req, res, next) => {
  // Resolve the promise returned by the handler function
  Promise.resolve(fn(req, res, next)).catch(err => {
    // Enhanced error logging (optional)
    console.error(`Async Handler Error: ${err.message}`);
    
    // Ensure the error is properly passed to Express error handling middleware
    next(err);
  });
};

module.exports = asyncHandler;