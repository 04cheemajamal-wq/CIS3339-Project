// This file contains all API endpoints for interacting with the "users" collection in the MongoDB database
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Make sure mongoose is imported (for testing delete before submission if a "main/master user already exist")?
const { users } = require('../models/models');

const org = process.env.ORG_ID;

// API endpoint to get all users for the current organization
router.get('/', async (req, res, next) => {
  try {
    // Fetch users for this org, excluding the password field for security
    const allUsers = await users.find({ org: org }).select('-password');
    res.json(allUsers);
  } catch (err) {
    next(err);
  }
});

// API endpoint to handle login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await users.findOne({ username: username, org: org });
    
    // Use the exact same generic error message to prevent username enumeration
    const genericAuthError = { message: 'Invalid username or password' };

    if (!user) {
      return res.status(400).json(genericAuthError);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(genericAuthError);
    }

    const payload = {
      name: user.username,
      role: user.role,
      orgId: user.org // Crucial for tenant isolation and token validation!
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Temporary route to create your first user [use for testing]
// (delete before submission, if a "master" user and password exist in the main .env file)?
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new users({
      _id: new mongoose.Types.ObjectId(), // Generates a valid MongoDB ObjectId maybe delete
      username,
      password: hashedPassword,
      role: role || 'admin',
      org: org
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
