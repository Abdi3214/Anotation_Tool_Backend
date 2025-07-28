// db.js
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    mongoose.connect("mongodb+srv://team60:XhCk9c5hUYeDuGRq@cluster0.gdru6.mongodb.net/mydb")
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 
