import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthCtxt } from "../context/AuthContext";
import SpinnerLoader from "../components/SpinnerLoader/SpinnerLoader";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, isAuthReady } = useContext(AuthCtxt);
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <SpinnerLoader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
