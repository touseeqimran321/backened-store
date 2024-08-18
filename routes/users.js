const express = require('express');
const User = require('../models/user'); // Ensure the path is correct
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'touseeq'; // Use a strong, secure secret key

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ error: 'Invalid token' });
      }

      req.user = decoded; // Attach the decoded token payload to the request object
      next();
    });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const payload = { id: newUser.id, email: newUser.email };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const payload = { id: user.id, email: user.email };
      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

      res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:id', authenticateUser, async (req, res) => {
  const userId = req.params.id;

  try {
    console.log("Fetching user with ID:", userId);

    const user = await User.findByPk(userId); // Corrected method to findByPk

    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("User found:", user);

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/get', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/checkUser', async (req, res) => { // Removed authenticateUser
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
