/**
 * @file db.js
 * @description Database connection setup and configuration for MongoDB using Mongoose.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
