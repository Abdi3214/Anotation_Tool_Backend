// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.connect("mongodb://localhost:27017/mydb")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
