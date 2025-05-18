const http = require('http');
const querystring = require('querystring');

// Register and login to get a session cookie
async function setupAndTestSave() {
  console.log('Setting up test user and testing save...');
  
  // Test user credentials
  const testUserEmail = `test_${Date.now()}@example.com`;
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = 'TestPassword123';
  let sessionCookie = null;
  
  try {
    // 1. Register user
    await new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        username: testUsername,
        email: testUserEmail,
        password: testPassword
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 302) {
            console.log('✅ User registration successful');
            resolve(true);
          } else {
            console.error('❌ User registration failed:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ User registration error:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });

    // 2. Login user to get session cookie
    await new Promise((resolve, reject) => {
      const postData = querystring.stringify({
        email: testUserEmail,
        password: testPassword
      });

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        // Store session cookie for later tests
        if (res.headers['set-cookie']) {
          sessionCookie = res.headers['set-cookie'][0].split(';')[0];
          console.log('Got session cookie:', sessionCookie);
        }
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 302 && sessionCookie) {
            console.log('✅ User login successful');
            resolve(true);
          } else {
            console.error('❌ User login failed:', data);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ User login error:', error.message);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });

    // 3. Try the test-save endpoint
    if (sessionCookie) {
      await new Promise((resolve, reject) => {
        const postData = JSON.stringify({
          testField: 'testValue',
          time: Date.now()
        });

        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/game/test-save',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie,
            'User-Agent': 'test-client/1.0'
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode === 200) {
              console.log('✅ Test save successful');
              console.log('Response:', data);
              resolve(true);
            } else {
              console.error('❌ Test save failed:', data);
              console.error('Status code:', res.statusCode);
              resolve(false);
            }
          });
        });

        req.on('error', (error) => {
          console.error('❌ Test save error:', error.message);
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
setupAndTestSave();
