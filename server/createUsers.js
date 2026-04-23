require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// 🔌 connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

async function createUsers() {
  try {
    const hashed = await bcrypt.hash("123456", 10);

    // Admin
    await User.create({
  name: "Admin",
  email: "admin@gmail.com",
  password: hashed,
  role: "admin"
});

await User.create({
  name: "Worker 1",
  email: "worker1@gmail.com",
  password: hashed,
  role: "worker"
});

await User.create({
  name: "Worker 2",
  email: "worker2@gmail.com",
  password: hashed,
  role: "worker"
});

await User.create({
  name: "Worker 3",
  email: "worker3@gmail.com",
  password: hashed,
  role: "worker"
});

    console.log("✅ Users created successfully");

    process.exit();
  } catch (err) {
    console.log(err);
  }
}

createUsers();