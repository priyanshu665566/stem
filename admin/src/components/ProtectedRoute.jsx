import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute(){
    const { isAuthenticated, loading } = useAuth();
    
    if(loading) return null;
    
    if(!isAuthenticated){
        return <Navigate to='/login' replace />;
    }
    return <Outlet />;
}

export function AdminRoute(){
    const { isAdmin, loading } = useAuth();
    
    if(loading) return null;
    
    if(!isAdmin){
        return <Navigate to='/dashboard' replace />;
    }
    return <Outlet />;
}

export function UserRoute(){
    const { isUser, loading } = useAuth();
    
    if(loading) return null;
    
    if(!isUser){
        return <Outlet />;
    }
    return <Navigate to='/dashboard' replace />;
}

export default ProtectedRoute