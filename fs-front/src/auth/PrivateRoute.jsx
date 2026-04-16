import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export const PrivateRoute = () => {
    const { isAuthenticated } = useUser();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};