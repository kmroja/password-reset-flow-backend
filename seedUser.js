const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const createTestUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("test1234", 10);

  const user = new User({
    email: "rojamahendiran825@gmail.com",
    password: hashedPassword,
  });

  await user.save();
  console.log(" Test user created");
  mongoose.disconnect();
};

createTestUser().catch((err) => console.error(err));
