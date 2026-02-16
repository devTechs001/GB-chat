import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials - adjust these as needed
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

async function testLogin() {
  try {
    console.log('Testing login endpoint...');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);

    console.log('Login successful!');
    console.log('Response data:', response.data);
    return true;
  } catch (error) {
    console.log('Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

async function testRegister() {
  try {
    console.log('\nTesting registration endpoint...');

    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

    console.log('Registration successful!');
    console.log('Response data:', response.data);
    return true;
  } catch (error) {
    console.log('Registration failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting authentication tests...\n');

  // First try to register
  const registerSuccess = await testRegister();

  if (registerSuccess) {
    // Wait a bit for the DB to update, then try login
    setTimeout(async () => {
      await testLogin();
    }, 1000);
  } else {
    // If registration failed because user exists, just try login
    console.log("\nRegistration failed, possibly because user already exists. Trying login...");
    await testLogin();
  }
}

runTests();