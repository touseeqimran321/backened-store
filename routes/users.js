const express = require('express');
const User = require('../models/user')
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ id: newUser.id, username: newUser.username, email: newUser.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get a list of users.
 *     description: Retrieve a list of users from the database.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               
 *                
 */


router.get('/user', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
