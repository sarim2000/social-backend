const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    var email =req.body.email
    const oldUser = await User.findOne({email});

    if (oldUser) {
      console.log("o",oldUser)
      return res.status(409).send("User Already Exist. Please Login");
    }

    const user = await  User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const accessToken = jwt.sign({user},process.env.TOKEN_KEY)
    
    user.token = accessToken
    res.status(201).json(user);
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("here")
    const { email, password } = req.body;
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({user},process.env.TOKEN_KEY)
      user.token = token;
      res.status(200).json(user);
    }
    res.status(400).json("wrong password")
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;