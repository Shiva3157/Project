// Complete Destinations System Test
const axios = require('axios');

async function runCompleteTest() {
    console.log('🧪 COMPLETE DESTINATIONS SYSTEM TEST\n');
    
    const results = {
        database: false,
        backend: false,
        api_endpoints: false,
        frontend_ready: false,
        overall_status: 'FAIL'
    };

    try {
        // 1. Database Test
        console.log('1️⃣ Testing Database Connection...');
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'manager',
            database: process.env.DB_NAME || 'travelmanagementsystem',
            port: process.env.DB_PORT || 3306
        });
        
        const [destinations] = await connection.execute('SELECT COUNT(*) as count FROM destinations');
        console.log(`   ✅ Database: ${destinations[0].count} destinations found`);
        results.database = true;
        await connection.end();

        // 2. Backend Health Test
        console.log('\n2️⃣ Testing Backend Health...');
        const healthResponse = await axios.get('http://localhost:5000/health');
        console.log(`   ✅ Backend: ${healthResponse.data.message}`);
        results.backend = true;

        // 3. API Endpoints Test
        console.log('\n3️⃣ Testing API Endpoints...');
        
        // Test GET /api/destinations
        const destResponse = await axios.get('http://localhost:5000/api/destinations');
        console.log(`   ✅ GET /destinations: ${destResponse.data.data.count} destinations`);
        
        // Test GET /api/destinations/popular
        const popularResponse = await axios.get('http://localhost:5000/api/destinations/popular');
        console.log(`   ✅ GET /destinations/popular: ${popularResponse.data.data.count} popular destinations`);
        
        // Test GET /api/destinations/:id
        const singleResponse = await axios.get('http://localhost:5000/api/destinations/1');
        console.log(`   ✅ GET /destinations/1: ${singleResponse.data.data.destination.name}`);
        
        results.api_endpoints = true;

        // 4. Frontend Readiness Test
        console.log('\n4️⃣ Testing Frontend Readiness...');
        try {
            const frontendResponse = await axios.get('http://localhost:3000', { timeout: 3000 });
            console.log('   ✅ Frontend: Running on port 3000');
            results.frontend_ready = true;
        } catch (error) {
            console.log('   ❌ Frontend: Not running on port 3000');
            console.log('   💡 Start with: cd frontend && npm start');
        }

        // Overall Status
        console.log('\n📊 SYSTEM STATUS SUMMARY:');
        console.log(`   Database: ${results.database ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`   Backend API: ${results.backend ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`   API Endpoints: ${results.api_endpoints ? '✅ WORKING' : '❌ FAILED'}`);
        console.log(`   Frontend: ${results.frontend_ready ? '✅ WORKING' : '❌ NOT RUNNING'}`);

        if (results.database && results.backend && results.api_endpoints) {
            results.overall_status = results.frontend_ready ? 'FULLY WORKING' : 'BACKEND READY - START FRONTEND';
        }

        console.log(`\n🎯 OVERALL STATUS: ${results.overall_status}`);

        if (results.overall_status === 'FULLY WORKING') {
            console.log('\n🎉 ALL SYSTEMS GO! Destinations functionality is fully operational.');
            console.log('🌐 Access destinations at: http://localhost:3000/destinations');
        } else if (results.overall_status === 'BACKEND READY - START FRONTEND') {
            console.log('\n⚠️  Backend is working perfectly. Start frontend to complete setup:');
            console.log('   cd frontend && npm start');
        }

    } catch (error) {
        console.error('\n❌ System Test Error:', error.message);
        
        if (error.code === 'ECONNREFUSED' && error.port === 5000) {
            console.log('💡 Backend server not running. Start with: cd backend && npm start');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Database access denied. Check credentials in backend/.env');
        }
    }

    return results;
}

runCompleteTest();