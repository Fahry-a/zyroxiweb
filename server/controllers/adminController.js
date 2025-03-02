const db = require('../config/database');

const adminController = {
  getAllUsers: async (req, res, next) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
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

      let query = 'UPDATE users SET ';
      const updates = [];
      const values = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }
      if (role) {
        updates.push('role = ?');
        values.push(role);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No updates provided' });
      }

      query += updates.join(', ') + ' WHERE id = ?';
      values.push(userId);

      const [result] = await db.execute(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const [result] = await db.execute('DELETE FROM users WHERE id = ?', [
        userId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  getStatistics: async (req, res, next) => {
    try {
      // Get total users
      const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
      
      // Get users registered today
      const [newUsers] = await db.execute(
        'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()'
      );

      // Get users by role
      const [usersByRole] = await db.execute(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role'
      );

      res.json({
        totalUsers: totalUsers[0].count,
        newUsers: newUsers[0].count,
        usersByRole: usersByRole.reduce((acc, curr) => {
          acc[curr.role] = curr.count;
          return acc;
        }, {})
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;