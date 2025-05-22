// Form-based login test
const axios = require('axios');
const qs = require('querystring');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function testLogin() {
  try {
    console.log('FORM-BASED LOGIN TEST');
    console.log('====================\n');
    
    // Initialize cookie jar
    const cookieJar = new tough.CookieJar();
    const instance = wrapper(axios.create({ jar: cookieJar }))
    });
    
    // Step 1: Fetch the login page to get any CSRF token if needed
    console.log('1. Fetching login page...');
    const loginPageResponse = await instance.get('http://localhost:3000/auth/login');
    console.log(`Status: ${loginPageResponse.status}`);
    
    // Load HTML into cheerio
    const $ = cheerio.load(loginPageResponse.data);
    console.log(`Page title: ${$('title').text()}`);
    
    // Check for form
    const form = $('form[action="/auth/login"]');
    if (form.length === 0) {
      console.log('❌ Login form not found on page');
      return;
    }
    console.log('✅ Login form found');
    
    // Extract any hidden form fields (like CSRF tokens)
    const formData = {};
    form.find('input').each((i, el) => {
      const input = $(el);
      const name = input.attr('name');
      if (name) {
        formData[name] = input.val() || '';
      }
    });
    
    // Add login credentials
    formData.emailOrUsername = 'admin@example.com';
    formData.password = 'Admin123!';
    
    console.log('Form data being submitted:');
    for (const [key, value] of Object.entries(formData)) {
      console.log(`- ${key}: ${key === 'password' ? '[HIDDEN]' : value}`);
    }
    
    // Step 2: Submit login form
    console.log('\n2. Submitting login form...');
    const loginResponse = await instance.post(
      'http://localhost:3000/auth/login',
      qs.stringify(formData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        maxRedirects: 0,
        validateStatus: function(status) {
          return status >= 200 && status < 400;
        }
      }
    );
    
    console.log(`Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 302) {
      console.log(`✅ Login successful, redirected to: ${loginResponse.headers.location}`);
      
      // Follow redirect
      console.log('\n3. Following redirect...');
      const redirectResponse = await instance.get(`http://localhost:3000${loginResponse.headers.location}`);
      console.log(`Status: ${redirectResponse.status}`);
      
      const $redirectPage = cheerio.load(redirectResponse.data);
      console.log(`Page title: ${$redirectPage('title').text()}`);
      
      // Check if we're logged in
      const logoutLink = $redirectPage('a:contains("Logout")');
      if (logoutLink.length > 0) {
        console.log('✅ Found logout link, user is logged in');
      } else {
        console.log('❌ No logout link found, login may have failed');
      }
    } else {
      console.log('❌ Login failed, no redirect');
      
      // Check if we're still on the login page
      const $loginResult = cheerio.load(loginResponse.data);
      console.log(`Page title: ${$loginResult('title').text()}`);
      
      // Check for error messages
      const errors = $loginResult('.error, .message.error, .alert-danger');
      if (errors.length > 0) {
        console.log('Error messages:');
        errors.each((i, el) => {
          console.log(`- ${$loginResult(el).text().trim()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();
