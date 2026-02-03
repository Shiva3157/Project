// Test destinations API endpoint
const axios = require('axios');

async function testDestinationsAPI() {
    const baseURL = 'http://localhost:5000/api';
    
    try {
        console.log('🧪 Testing Destinations API...\n');
        
        // Test health endpoint first
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log('✅ Health check:', healthResponse.data.message);
        
        // Test get all destinations
        console.log('\n2. Testing GET /api/destinations...');
        const destinationsResponse = await axios.get(`${baseURL}/destinations`);
        console.log('✅ Status:', destinationsResponse.status);
        console.log('✅ Success:', destinationsResponse.data.success);
        console.log('✅ Count:', destinationsResponse.data.data.count);
        console.log('📍 Destinations:');
        destinationsResponse.data.data.destinations.forEach(dest => {
            console.log(`   - ${dest.name}, ${dest.country}`);
        });
        
        // Test get popular destinations
        console.log('\n3. Testing GET /api/destinations/popular...');
        const popularResponse = await axios.get(`${baseURL}/destinations/popular`);
        console.log('✅ Status:', popularResponse.status);
        console.log('✅ Success:', popularResponse.data.success);
        console.log('✅ Popular destinations count:', popularResponse.data.data.count);
        
        // Test get destination by ID
        console.log('\n4. Testing GET /api/destinations/1...');
        const destinationResponse = await axios.get(`${baseURL}/destinations/1`);
        console.log('✅ Status:', destinationResponse.status);
        console.log('✅ Success:', destinationResponse.data.success);
        console.log('✅ Destination:', destinationResponse.data.data.destination.name);
        
        console.log('\n🎉 All destinations API tests passed!');
        console.log('💡 The destinations functionality is working correctly.');
        console.log('🔍 If frontend is showing errors, check:');
        console.log('   - Browser console for JavaScript errors');
        console.log('   - Network tab for failed API calls');
        console.log('   - Frontend is running on http://localhost:3000');
        
    } catch (error) {
        console.error('❌ API Test Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Backend server is not running. Start it with:');
            console.log('   cd backend && npm start');
        } else if (error.response) {
            console.log('❌ Response Status:', error.response.status);
            console.log('❌ Response Data:', error.response.data);
        }
    }
}

testDestinationsAPI();