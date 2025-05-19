
/**
 * Middleware to check if the user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  // If not authenticated, redirect to login page
  res.redirect('/auth/login');
}

/**
 * API version - returns 401 instead of redirecting
 * Used for API requests that require authentication
 */
function isAuthenticatedApi(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  
  // If not authenticated, return unauthorized status
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = {
  isAuthenticated,
  isAuthenticatedApi
};
