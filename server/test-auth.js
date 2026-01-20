// Test script for authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAuth() {
    try {
        console.log('Testing registration...');
        const registerResponse = await axios.post(`${BASE_URL}/api/register`, {
            username: 'testuser',
            password: 'testpass',
            salary: 5000
        });
        console.log('Registration successful:', registerResponse.data);

        console.log('\nTesting login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
            username: 'testuser',
            password: 'testpass'
        });
        console.log('Login successful:', loginResponse.data);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testAuth();
