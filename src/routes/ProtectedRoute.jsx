import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedTypes }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  // No user: redirect to login
  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If allowedTypes is specified, check if user.type matches
  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
