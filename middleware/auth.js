
/**
 * Middleware to check if the user is authenticated
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Make the user object available to views
    res.locals.user = req.session.user;
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
    res.locals.user = req.session.user;
    return next();
  }
  
  // If not authenticated, return unauthorized status
  res.status(401).json({ error: 'Unauthorized' });
}

/**
 * Middleware to check if the user is an admin
 */
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    res.locals.user = req.session.user;
    return next();
  }
  
  // If not an admin, redirect to dashboard
  res.status(403).render('error', { 
    message: 'Access Denied', 
    details: 'You do not have permission to access this area.' 
  });
}

/**
 * API version for admin check
 */
function isAdminApi(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    res.locals.user = req.session.user;
    return next();
  }
  
  // If not an admin, return forbidden status
  res.status(403).json({ error: 'Access denied' });
}

module.exports = {
  isAuthenticated,
  isAuthenticatedApi,
  isAdmin,
  isAdminApi
};
