// Update existing hotel bookings to confirmed status
const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateHotelBookings() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'manager',
            database: process.env.DB_NAME || 'travelmanagementsystem',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Database connected');

        // Update hotel bookings status
        const [result1] = await connection.execute(
            "UPDATE hotel_booking SET status = 'confirmed' WHERE status = 'pending'"
        );
        console.log(`✅ Updated ${result1.affectedRows} hotel booking statuses to confirmed`);

        // Update hotel bookings payment status
        const [result2] = await connection.execute(
            "UPDATE hotel_booking SET payment_status = 'paid' WHERE payment_status = 'pending' OR payment_status IS NULL"
        );
        console.log(`✅ Updated ${result2.affectedRows} hotel booking payment statuses to paid`);

        // Also update package bookings if needed
        const [result3] = await connection.execute(
            "UPDATE booking SET status = 'confirmed' WHERE status = 'pending'"
        );
        console.log(`✅ Updated ${result3.affectedRows} package booking statuses to confirmed`);

        console.log('\n🎉 All bookings updated successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

updateHotelBookings();