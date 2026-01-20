const mongoose = require('mongoose');

// Use hardcoded URI for development - replace with your MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

const conn = mongoose.connect(mongoURI)
    .then(db => {
        console.log("Database Connected to: " + mongoURI);
        return db;
    }).catch(err => {
        console.log("Connection Error: " + err);
        console.log("Make sure MongoDB is running on your system");
    })

    module.exports = conn;