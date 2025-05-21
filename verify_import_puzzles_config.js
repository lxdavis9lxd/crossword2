// Script to test if the import-puzzles route is properly configured

const fs = require('fs');
const path = require('path');

function testImportPuzzlesPages() {
  console.log('Testing import-puzzles configuration...\n');
  
  // Check if the view file exists
  const viewPath = path.join(__dirname, 'views/admin/import-puzzles.ejs');
  
  console.log('Checking if the view file exists...');
  if (fs.existsSync(viewPath)) {
    console.log('✅ The view file exists at:', viewPath);
  } else {
    console.log('❌ The view file does NOT exist at:', viewPath);
  }
  
  // Check if the route is defined in admin.js
  const adminRoutePath = path.join(__dirname, 'routes/admin.js');
  
  console.log('\nChecking if the route is defined in admin.js...');
  if (fs.existsSync(adminRoutePath)) {
    const adminRouteContent = fs.readFileSync(adminRoutePath, 'utf8');
    
    // Check for GET route
    const hasGetRoute = adminRouteContent.includes("router.get('/import-puzzles'");
    console.log('GET route defined?', hasGetRoute ? '✅ Yes' : '❌ No');
    
    // Check for POST route
    const hasPostRoute = adminRouteContent.includes("router.post('/import-puzzles'");
    console.log('POST route defined?', hasPostRoute ? '✅ Yes' : '❌ No');
    
    // Check for multer upload configuration
    const hasMulter = adminRouteContent.includes('const upload = multer');
    console.log('Multer upload configured?', hasMulter ? '✅ Yes' : '❌ No');
    
    if (hasGetRoute && hasPostRoute && hasMulter) {
      console.log('\n✅ All necessary routes and configurations are present in admin.js');
    } else {
      console.log('\n❌ Some routes or configurations are missing in admin.js');
    }
  } else {
    console.log('❌ The admin.js file does NOT exist at:', adminRoutePath);
  }

  // Check if the middleware is correctly set up
  const authMiddlewarePath = path.join(__dirname, 'middleware/auth.js');
  
  console.log('\nChecking if the authentication middleware is correctly set up...');
  if (fs.existsSync(authMiddlewarePath)) {
    const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
    
    // Check for admin middleware
    const hasAdminMiddleware = authMiddlewareContent.includes('function isAdmin');
    console.log('Admin middleware defined?', hasAdminMiddleware ? '✅ Yes' : '❌ No');
    
    // Check middleware logic
    const hasCorrectLogic = authMiddlewareContent.includes("req.session.user.role === 'admin'");
    console.log('Admin role check logic exists?', hasCorrectLogic ? '✅ Yes' : '❌ No');
  } else {
    console.log('❌ The auth.js middleware file does NOT exist at:', authMiddlewarePath);
  }

  console.log('\nChecking app.js for router mounting...');
  const appPath = path.join(__dirname, 'app.js');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // Check for admin routes mounting
    const hasAdminRoute = appContent.includes("app.use('/admin', adminRouter)");
    console.log('Admin routes mounted in app.js?', hasAdminRoute ? '✅ Yes' : '❌ No');
  } else {
    console.log('❌ The app.js file does NOT exist at:', appPath);
  }
}

testImportPuzzlesPages();
