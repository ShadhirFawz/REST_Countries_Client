// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div className="text-center mt-20">Loading...</div>;

  return user ? children : <Navigate to="/login" />;
}
