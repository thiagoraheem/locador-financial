import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RootState } from '../store';
import { setUser, logout } from '../store/slices/authSlice';
import { authApi } from '../services/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, loading } = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !isAuthenticated) {
        try {
          const response = await authApi.me();
          dispatch(setUser(response.data));
        } catch (error) {
          dispatch(logout());
        }
      }
      setInitializing(false);
    };

    initializeAuth();
  }, [token, isAuthenticated, dispatch]);

  if (initializing || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};