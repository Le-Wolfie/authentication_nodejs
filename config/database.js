const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
