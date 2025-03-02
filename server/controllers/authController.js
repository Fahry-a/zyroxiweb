const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Get user with role
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Remove password from user object
      delete user.password;

      res.json({
        token,
        user: user
      });
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Check if user exists
      const [existingUsers] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert user
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );

      res.status(201).json({
        message: 'User created successfully',
        userId: result.insertId
      });
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userData.userId;

      // Get user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },  // Add comma here

  deleteAccount: async (req, res, next) => {
    try {
      const { password } = req.body;
      const userId = req.userData.userId;

      // Get user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Delete user
      await db.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;