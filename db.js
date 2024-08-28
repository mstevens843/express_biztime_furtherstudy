/** Database setup for BizTime. */
// Set up to establish connection to the PostgreSQL database.
// Configuration to connect to the database and export the db client for use in the app.

const { Client } = require('pg');

// If the environment variable DATABASE_URL is set, use that to connect to the database.
// This is useful for deploying to platforms like Heroku where the database URL is provided.
let db;

if (process.env.NODE_ENV === "test") {
    db = new Client({
        connectionString: "postgresql:///biztime_test" // Use a separate test database connection.
    }); 
} else {
    db = new Client({
        connectionString: "postgresql:///biztime" // Default connection string for local development.
    });
}

db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

module.exports = db;
