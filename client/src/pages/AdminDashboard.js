import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Chip,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  StarBorder as PremiumIcon,
  AccessTime as ClockIcon,
  Group as UsersIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAdminStatistics,
} from '../services/adminApi';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    newUsers: 0,
    usersByRole: { premium: 0, admin: 0 }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  // Update current date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatted = now.toLocaleString('en-US', options)
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch users and statistics
  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        getAllUsers(),
        getAdminStatistics()
      ]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setStatistics(statsData);
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  const handleEditClick = async (userId) => {
    try {
      const userData = await getUserDetails(userId);
      setSelectedUser(userData);
      setEditFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      setOpenEditDialog(true);
    } catch (err) {
      setError('Failed to fetch user details');
    }
  };

  const handleEditSubmit = async () => {
    try {
      await updateUser(selectedUser.id, editFormData);
      setSuccess('User updated successfully');
      setOpenEditDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteClick = (userData) => {
    setSelectedUser(userData);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(selectedUser.id);
      setSuccess('User deleted successfully');
      setOpenDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return (
          <Chip
            icon={<AdminIcon />}
            label="Administrator"
            color="warning"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      case 'premium':
        return (
          <Chip
            icon={<PremiumIcon />}
            label="Premium"
            color="success"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
      default:
        return (
          <Chip
            icon={<PersonIcon />}
            label="Regular"
            color="primary"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AdminIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          {/* Current Date Time Display */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 1
          }}>
            <ClockIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}
            </Typography>
          </Box>

          {/* Current User Display */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mr: 3,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            padding: '4px 12px',
            borderRadius: 1
          }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Current User's Login: {user?.name}
            </Typography>
          </Box>

          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            User Dashboard
          </Button>

          <IconButton 
            color="inherit" 
            onClick={() => {
              logout();
              navigate('/');
            }}
            title="Logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UsersIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h4">{statistics.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Regular Users</Typography>
                </Box>
                <Typography variant="h4">
                  {statistics.totalUsers - (statistics.usersByRole.premium + statistics.usersByRole.admin)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PremiumIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">Premium Users</Typography>
                </Box>
                <Typography variant="h4">{statistics.usersByRole.premium}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AdminIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6">Admins</Typography>
                </Box>
                <Typography variant="h4">{statistics.usersByRole.admin}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Box */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name, email or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
        </Box>

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleEditClick(user.id)}
                        size="small"
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteClick(user)}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Edit User Dialog */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
        >
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
            />
            <TextField
              margin="normal"
              fullWidth
              select
              label="Role"
              value={editFormData.role}
              onChange={(e) =>
                setEditFormData({ ...editFormData, role: e.target.value })
              }
            >
              <MenuItem value="user">Regular User</MenuItem>
              <MenuItem value="premium">Premium User</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "{selectedUser?.name}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbars */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setError('')} 
            severity="error"
          >
            {error}
          </Alert>
        </Snackbar>

                <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSuccess('')} 
            severity="success"
          >
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminDashboard;