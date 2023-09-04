require("dotenv").config();
// import connectDB from database.js
const connectDB = require("./config/database");
connectDB();

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const express = require("express");

const app = express();

const User = require("./model/user");

const auth = require("./middleware/auth");

app.use(express.json());

// register a new user
app.post("/register", async (req, res) => {
  try {
    // 1. get the user input
    const { first_name, last_name, email, password } = req.body;
    // 2. validate the user input
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // 3. check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).send({ message: "User already exists" });
    }
    // 4. encrypt the user password
    encryptedPassword = await bcrypt.hash(password, 10);
    // 5. create a new user
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    // 6. create user token
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    // 7. save token, then return the user
    user.token = token;
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});

// login a registered user
app.post("/login", async (req, res) => {
  try {
    // 1. get the user input
    const { email, password } = req.body;
    // 2. validate the user input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // 3. check if the user already exists in the database
    const user = await User.findOne({ email });
    // bcrypt.compare returns a promise, a promise is always a truthy value
    // that's why it needs to be awaited to get the actual boolean value
    if (user && (await bcrypt.compare(password, user.password))) {
      // 4. create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );
      // 5. save token, then return the user
      user.token = token;
      return res.status(200).json(user);
    }
    res.status(400).json({ message: "Invalid credentials" });
  } catch (error) {
    console.log(error);
  }
});

// only authorized users can access this route
app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Willkommen, Ihre Benutzer-ID ist " + req.user_id);
});

module.exports = app;
