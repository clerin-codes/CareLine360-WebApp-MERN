import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRole, hasToken } from "../auth/authStorage";
import { getDoctorProfile } from "../api/doctorApi";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const token = hasToken();
  const role = getRole();

  const [profileChecked, setProfileChecked] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (role === "doctor" && token && location.pathname !== "/doctor/setup") {
      getDoctorProfile()
        .then(() => {
          setNeedsSetup(false);
        })
        .catch((err) => {
          if (err?.response?.status === 403 || err?.response?.status === 404) {
            setNeedsSetup(true);
          }
        })
        .finally(() => setProfileChecked(true));
    } else {
      setProfileChecked(true);
    }
  }, [role, token, location.pathname]);

  // Not logged in
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  // Role not allowed
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;

  // Wait for profile check for doctor
  if (role === "doctor" && !profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Doctor needs to complete profile first
  if (role === "doctor" && needsSetup && location.pathname !== "/doctor/setup") {
    return <Navigate to="/doctor/setup" replace />;
  }

  return <Outlet />;
}