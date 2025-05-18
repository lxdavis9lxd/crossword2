
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

module.exports = {
  isAuthenticated
};
