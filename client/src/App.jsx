import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Patient Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import Profile from "./pages/patient/Profile";
import Documents from "./pages/patient/Documents";
import PatientNavbar from "./pages/patient/PatientNavbar";

// Doctor Module
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<div className="p-6">Landing</div>} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Patient Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/profile" element={<Profile />} />
            <Route path="/patient/documents" element={<Documents />} />
            <Route path="/patient/PatientNavbar" element={<PatientNavbar />} />
          </Route>

          {/* Doctor Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
            <Route
              path="/doctor/dashboard"
              element={
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
