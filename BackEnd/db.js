// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.connect("mongodb+srv://teamHebel:%40123098%3B@cluster0.gdru6.mongodb.net/mydb")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
