// Test script to check destinations functionality
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDestinations() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'travelmanagementsystem',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Database connected successfully');

        // Check if destinations table exists
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'destinations'"
        );

        if (tables.length === 0) {
            console.log('❌ Destinations table does not exist');
            console.log('🔧 Creating destinations table...');
            
            await connection.execute(`
                CREATE TABLE destinations (
                    destination_id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    country VARCHAR(50) NOT NULL,
                    description TEXT,
                    image_url VARCHAR(255),
                    best_time_to_visit VARCHAR(100),
                    popular_attractions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log('✅ Destinations table created');
        } else {
            console.log('✅ Destinations table exists');
        }

        // Check if destinations table has data
        const [destinations] = await connection.execute('SELECT COUNT(*) as count FROM destinations');
        const count = destinations[0].count;

        if (count === 0) {
            console.log('❌ No destinations found, inserting sample data...');
            
            await connection.execute(`
                INSERT INTO destinations (name, country, description, image_url, best_time_to_visit, popular_attractions) VALUES
                ('Rajasthan', 'India', 'Land of kings with magnificent palaces and forts', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'October to March', 'Jaipur City Palace, Udaipur Lake Palace, Jaisalmer Fort'),
                ('Kerala', 'India', 'Gods own country with backwaters and spices', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'September to March', 'Alleppey Backwaters, Munnar Tea Gardens, Kochi Fort'),
                ('Goa', 'India', 'Beach paradise with Portuguese heritage', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'November to February', 'Baga Beach, Old Goa Churches, Dudhsagar Falls'),
                ('Himachal Pradesh', 'India', 'Mountain state with adventure opportunities', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'March to June, September to November', 'Shimla Mall Road, Manali Solang Valley, Dharamshala'),
                ('Uttarakhand', 'India', 'Land of gods with spiritual and adventure tourism', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'April to June, September to November', 'Rishikesh, Haridwar, Valley of Flowers, Kedarnath')
            `);
            
            console.log('✅ Sample destinations inserted');
        } else {
            console.log(`✅ Found ${count} destinations in database`);
        }

        // Test the destinations query
        const [allDestinations] = await connection.execute('SELECT * FROM destinations ORDER BY name ASC');
        console.log('📍 Available destinations:');
        allDestinations.forEach(dest => {
            console.log(`   - ${dest.name}, ${dest.country}`);
        });

        console.log('\n🎉 Destinations functionality test completed successfully!');
        console.log('🌐 You can now test the API at: http://localhost:5000/api/destinations');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure MySQL server is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Check your database credentials in backend/.env file');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 Database does not exist. Create it first:');
            console.log('   mysql -u root -p -e "CREATE DATABASE travelmanagementsystem;"');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDestinations();