const db = require('../config/database');

const adminController = {
  getDashboardStats: async (req, res, next) => {
    try {
      // Get total users count
      const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users');
      
      // Get users by role
      const [usersByRole] = await db.execute(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `);

      // Get recent users
      const [recentUsers] = await db.execute(`
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      res.json({
        totalUsers: totalUsers[0].total,
        usersByRole,
        recentUsers
      });
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const [users] = await db.execute(`
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);

      res.json({ users });
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req, res, next) => {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
        [req.params.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      const userId = req.params.id;

      // Prevent admin from changing their own role
      if (userId === req.user.id && role !== 'admin') {
        return res.status(400).json({ 
          message: 'Cannot change your own admin role' 
        });
      }

      // Validate role
      const validRoles = ['user', 'premium', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          message: 'Invalid role' 
        });
      }

      // Check if email is already taken
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already taken' });
      }

      await db.execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, userId]
      );

      const [updatedUser] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );

      if (!updatedUser.length) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        message: 'User updated successfully',
        user: updatedUser[0]
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const userId = req.params.id;

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ 
          message: 'Cannot delete your own admin account' 
        });
      }

      // Check if user exists and is not an admin
      const [users] = await db.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (users[0].role === 'admin') {
        return res.status(400).json({ 
          message: 'Cannot delete admin users' 
        });
      }

      await db.execute('DELETE FROM users WHERE id = ?', [userId]);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
  
  createUser: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      // Validate input
      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if email exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );

      // Log action
      await db.execute(
        'INSERT INTO admin_logs (action, user_id, details) VALUES (?, ?, ?)',
        ['CREATE_USER', req.user.id, `Created user: ${email}`]
      );

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: result.insertId,
          name,
          email,
          role
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  suspendUser: async (req, res, next) => {
    try {
      const userId = req.params.id;

      // Check if user exists and is not an admin
      const [users] = await db.execute(
        'SELECT role FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (users[0].role === 'admin') {
        return res.status(400).json({ message: 'Cannot suspend admin users' });
      }

      await db.execute(
        'UPDATE users SET suspended = 1 WHERE id = ?',
        [userId]
      );

      // Log action
      await db.execute(
        'INSERT INTO admin_logs (action, user_id, details) VALUES (?, ?, ?)',
        ['SUSPEND_USER', req.user.id, `Suspended user ID: ${userId}`]
      );

      res.json({ message: 'User suspended successfully' });
    } catch (error) {
      next(error);
    }
  },

  unsuspendUser: async (req, res, next) => {
    try {
      const userId = req.params.id;

      await db.execute(
        'UPDATE users SET suspended = 0 WHERE id = ?',
        [userId]
      );

      // Log action
      await db.execute(
        'INSERT INTO admin_logs (action, user_id, details) VALUES (?, ?, ?)',
        ['UNSUSPEND_USER', req.user.id, `Unsuspended user ID: ${userId}`]
      );

      res.json({ message: 'User unsuspended successfully' });
    } catch (error) {
      next(error);
    }
  },

  getLogs: async (req, res, next) => {
    try {
      const [logs] = await db.execute(`
        SELECT 
          al.id,
          al.action,
          al.timestamp,
          al.details,
          u.email as userEmail
        FROM admin_logs al
        JOIN users u ON al.user_id = u.id
        ORDER BY al.timestamp DESC
        LIMIT 100
      `);

      res.json({ logs });
    } catch (error) {
      next(error);
    }
  }
  
};

module.exports = adminController;