import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
// import PatientDashboard from "./pages/patient/PatientDashboard";
// import DoctorDashboard from "./pages/doctor/DoctorDashboard";
// import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-6">Landing</div>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
