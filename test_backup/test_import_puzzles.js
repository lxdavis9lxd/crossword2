// Test script to check if the import-puzzles route is working

const axios = require('axios');
const cheerio = require('cheerio');

async function testImportPuzzlesRoute() {
  try {
    console.log('Testing import-puzzles route...');
    
    // Make GET request to the import-puzzles page
    const response = await axios.get('http://localhost:3000/admin/import-puzzles');
    
    if (response.status === 200) {
      console.log('✅ Success: Import puzzles page is accessible!');
      
      // Parse the HTML content
      const $ = cheerio.load(response.data);
      const pageTitle = $('title').text();
      const formExists = $('form[action="/admin/import-puzzles"]').length > 0;
      const fileInput = $('input[type="file"][name="excelFile"]').length > 0;
      
      console.log('Page Title:', pageTitle);
      console.log('Form exists:', formExists ? '✅ Yes' : '❌ No');
      console.log('File input exists:', fileInput ? '✅ Yes' : '❌ No');
      
      if (formExists && fileInput) {
        console.log('✅ Import puzzles form is correctly set up!');
      } else {
        console.log('❌ Import puzzles form is not correctly set up.');
      }
    } else {
      console.log(`❌ Error: Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing import-puzzles page:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testImportPuzzlesRoute();
