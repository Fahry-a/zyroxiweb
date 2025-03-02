const db = require('../config/database');

const adminController = {
  getAllUsers: async (req, res, next) => {
    try {
      const [users] = await db.execute(`
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  getUserDetails: async (req, res, next) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.params.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(users[0]);
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      const userId = req.params.userId;

      // Check if user exists
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user
      await db.execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, userId]
      );

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;

      // Check if user exists
      const [users] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user
      await db.execute('DELETE FROM users WHERE id = ?', [userId]);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getStatistics: async (req, res, next) => {
    try {
      // Get total users
      const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
      
      // Get users by role
      const [usersByRole] = await db.execute(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);

      // Get new users today
      const [newUsers] = await db.execute(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE DATE(created_at) = CURDATE()
      `);

      const roleStats = usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr.count;
        return acc;
      }, {});

      res.json({
        totalUsers: totalUsers[0].count,
        newUsers: newUsers[0].count,
        usersByRole: roleStats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;