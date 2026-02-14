import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import PrescriptionsPage from './pages/patient/PrescriptionsPage';
import SymptomChecker from './pages/patient/SymptomChecker';
import ChatbotPage from './pages/patient/ChatbotPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import SupportPage from './pages/patient/SupportPage';
import FAQPage from './pages/common/FAQPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
        if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
        if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to={getRoleDashboard(user?.role)} replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to={getRoleDashboard(user?.role)} replace /> : <RegisterPage />}
            />

            {/* Patient Routes */}
            <Route
                path="/patient/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <PatientDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/appointments"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <AppointmentBooking />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/prescriptions"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <PrescriptionsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/symptom-checker"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <SymptomChecker />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/patient/chatbot"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT']}>
                        <ChatbotPage />
                    </ProtectedRoute>
                }
            />

            {/* Doctor Routes */}
            <Route
                path="/doctor/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Common Routes */}
            <Route
                path="/support"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
                        <SupportPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/faq"
                element={
                    <ProtectedRoute allowedRoles={['PATIENT', 'DOCTOR']}>
                        <FAQPage />
                    </ProtectedRoute>
                }
            />

            {/* Default Route */}
            <Route
                path="/"
                element={
                    isAuthenticated ? (
                        <Navigate to={getRoleDashboard(user?.role)} replace />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function getRoleDashboard(role) {
    switch (role) {
        case 'PATIENT':
            return '/patient/dashboard';
        case 'DOCTOR':
            return '/doctor/dashboard';
        case 'ADMIN':
            return '/admin/dashboard';
        default:
            return '/login';
    }
}

export default App;
