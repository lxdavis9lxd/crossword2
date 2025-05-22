// Test script to check the admin import-puzzles route after logging in

const axios = require('axios');
const cheerio = require('cheerio');

async function testLoginAndImportPuzzles() {
  // Create a new axios instance that can handle cookies
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    maxRedirects: 5,
    // Add support for cookies
    jar: true,
    // Add debug headers
    validateStatus: function (status) {
      return status >= 200 && status < 600; // Accept all status codes to prevent exceptions
    }
  });
  
  try {
    console.log('Step 1: Logging in as admin...');
    
    // Get the login page to retrieve CSRF token if needed
    const loginPageResponse = await axiosInstance.get('/auth/login');
    
    // Extract CSRF token if present
    const $ = cheerio.load(loginPageResponse.data);
    const csrfToken = $('input[name="_csrf"]').val();
    
    console.log('CSRF token:', csrfToken ? '✅ Found' : '❌ Not found');
    
    // Prepare login data
    const loginData = {
      emailOrUsername: 'admin@example.com',
      password: 'Admin123!',
    };
    
    // If CSRF token exists, add it to the form data
    if (csrfToken) {
      loginData._csrf = csrfToken;
    }
    
    // Convert form data to URL-encoded format
    const urlEncodedData = new URLSearchParams(loginData).toString();
    
    // Attempt login
    const loginResponse = await axiosInstance.post('/auth/login', urlEncodedData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 5
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login successful?', loginResponse.status === 200 || loginResponse.status === 302 ? '✅ Yes' : '❌ No');
    
    // Step 2: Access the import-puzzles page
    console.log('\nStep 2: Accessing import-puzzles page...');
    const importPageResponse = await axiosInstance.get('/admin/import-puzzles');
    
    console.log('Import page response status:', importPageResponse.status);
    
    if (importPageResponse.status === 200) {
      console.log('✅ Success: Import puzzles page is accessible!');
      
      // Parse the HTML content
      const $importPage = cheerio.load(importPageResponse.data);
      const pageTitle = $importPage('title').text();
      const formExists = $importPage('form[action="/admin/import-puzzles"]').length > 0;
      const fileInput = $importPage('input[type="file"][name="excelFile"]').length > 0;
      
      console.log('Page Title:', pageTitle);
      console.log('Form exists:', formExists ? '✅ Yes' : '❌ No');
      console.log('File input exists:', fileInput ? '✅ Yes' : '❌ No');
      
      if (formExists && fileInput) {
        console.log('✅ Import puzzles form is correctly set up!');
      } else {
        console.log('❌ Import puzzles form is not correctly set up.');
      }
    } else {
      console.log(`❌ Error: Unexpected status code: ${importPageResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error during test:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testLoginAndImportPuzzles();
