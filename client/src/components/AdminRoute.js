import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    console.log('Current user:', user);
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default AdminRoute;