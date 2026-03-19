const mongoose = require("mongoose");
const User = require("./models/Users");
require("dotenv").config();

async function checkDb() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({});
  console.log("Users in DB:", users);
  mongoose.connection.close();
}

checkDb();
