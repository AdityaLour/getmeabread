const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDb Connected");
  } catch (error) {
    console.error("Database Connectiion failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
