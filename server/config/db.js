const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.error(`💡 PLEASE NOTE: The server is running, but database features will be unavailable.`);
    console.error(`👉 Make sure MongoDB is installed and running locally, or update MONGODB_URI in .env with a valid MongoDB Atlas connection string.\n`);
    // Removed process.exit(1) to prevent app crash
  }
};

module.exports = connectDB;
