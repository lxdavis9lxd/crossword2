// Admin create puzzle page access test
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function testPuzzleCreationPageAccess() {
  try {
    console.log('TESTING PUZZLE CREATION PAGE ACCESS\n');
    
    // Create an axios instance that maintains cookies between requests
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:3000',
      maxRedirects: 5,
      withCredentials: true,
      validateStatus: status => status >= 200 && status < 500
    });
    
    // Step 1: First, load the login page to get a session cookie
    console.log('1. Loading login page...');
    const loginPageResponse = await axiosInstance.get('/auth/login');
    
    if (loginPageResponse.status !== 200) {
      console.log(`❌ Failed to load login page: ${loginPageResponse.status}`);
      return;
    }
    console.log('✅ Login page loaded successfully');
    
    // Step 2: Submit login form
    console.log('\n2. Logging in...');
    const loginResponse = await axiosInstance.post('/auth/login', 
      new URLSearchParams({
        emailOrUsername: 'admin@example.com',
        password: 'Admin123!'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Check if we got redirected to dashboard or another page after login
    console.log(`Login response status: ${loginResponse.status}`);
    if (loginResponse.status === 302) {
      console.log(`Redirected to: ${loginResponse.headers.location}`);
    } else if (loginResponse.status === 200) {
      // If we weren't redirected, check if we're still on the login page
      const $ = cheerio.load(loginResponse.data);
      const loginForm = $('form[action="/auth/login"]');
      if (loginForm.length > 0) {
        console.log('❌ Login failed - still on login page');
        // Look for any error messages
        const errorMessages = $('.error, .message.error');
        if (errorMessages.length > 0) {
          console.log('Error message:', errorMessages.text().trim());
        }
        return;
      }
    }
    
    // Step 3: Get the admin dashboard
    console.log('\n3. Accessing admin dashboard...');
    const adminResponse = await axiosInstance.get('/admin');
    
    console.log(`Admin dashboard response status: ${adminResponse.status}`);
    if (adminResponse.status !== 200) {
      console.log('❌ Failed to access admin dashboard');
      return;
    }
    console.log('✅ Admin dashboard accessed successfully');
    
    // Step 4: Try to access puzzles list
    console.log('\n4. Accessing puzzles list...');
    const puzzlesResponse = await axiosInstance.get('/admin/puzzles');
    
    console.log(`Puzzles list response status: ${puzzlesResponse.status}`);
    if (puzzlesResponse.status !== 200) {
      console.log('❌ Failed to access puzzles list');
      // Save the error response to check
      fs.writeFileSync('puzzles_list_error.html', puzzlesResponse.data);
      console.log('Saved error response to puzzles_list_error.html');
      return;
    }
    console.log('✅ Puzzles list accessed successfully');
    
    // Save puzzles page for inspection
    fs.writeFileSync('puzzles_list.html', puzzlesResponse.data);
    console.log('Saved puzzles list to puzzles_list.html');
    
    // Check for Create New Puzzle button
    const $puzzlesList = cheerio.load(puzzlesResponse.data);
    const createButton = $puzzlesList('a.admin-button:contains("Create New Puzzle")');
    if (createButton.length === 0) {
      console.log('❌ Create New Puzzle button not found on puzzles page');
      return;
    }
    
    const createButtonUrl = createButton.attr('href');
    console.log(`✅ Create New Puzzle button found with URL: ${createButtonUrl}`);
    
    // Step 5: Access the create puzzle form
    console.log('\n5. Accessing create puzzle form...');
    const createFormResponse = await axiosInstance.get(createButtonUrl);
    
    console.log(`Create form response status: ${createFormResponse.status}`);
    if (createFormResponse.status !== 200) {
      console.log('❌ Failed to access create puzzle form');
      fs.writeFileSync('create_form_error.html', createFormResponse.data);
      console.log('Saved error response to create_form_error.html');
      return;
    }
    console.log('✅ Create puzzle form accessed successfully');
    
    // Save create form for inspection
    fs.writeFileSync('create_form.html', createFormResponse.data);
    console.log('Saved create form to create_form.html');
    
    // Examine the form structure
    const $createForm = cheerio.load(createFormResponse.data);
    const form = $createForm('form#createPuzzleForm');
    if (form.length === 0) {
      console.log('❌ Create puzzle form not found on page');
      return;
    }
    
    const formAction = form.attr('action');
    const formMethod = form.attr('method');
    console.log(`Form action: ${formAction}, method: ${formMethod}`);
    
    // List form fields
    console.log('\nForm fields:');
    form.find('input, select, textarea').each((i, el) => {
      const $el = $createForm(el);
      console.log(`- ${$el.attr('name')} (${$el.prop('tagName').toLowerCase()}${$el.attr('required') ? ', required' : ''})`);
    });
    
    console.log('\nTEST COMPLETE ✅');
    
  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

testPuzzleCreationPageAccess();
