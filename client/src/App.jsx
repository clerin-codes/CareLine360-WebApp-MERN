import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import EmergencyMonitoring from './pages/EmergencyMonitoring';
import Analytics from './pages/Analytics';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="emergencies" element={<EmergencyMonitoring />} />
                    <Route path="analytics" element={<Analytics />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
