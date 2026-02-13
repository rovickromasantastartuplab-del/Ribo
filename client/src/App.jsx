import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import SetPassword from './pages/auth/SetPassword';
import CreateCompany from './pages/onboarding/CreateCompany';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

// Public Route Wrapper (redirects if already logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (user) return <Navigate to="/" />;
    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } />
                    <Route path="/forgot-password" element={
                        <PublicRoute>
                            <ForgotPassword />
                        </PublicRoute>
                    } />
                    <Route path="/reset-password" element={
                        <ResetPassword />
                    } />
                    <Route path="/set-password" element={
                        <SetPassword />
                    } />

                    {/* Onboarding (Protected) */}
                    <Route path="/onboarding" element={
                        <ProtectedRoute>
                            <CreateCompany />
                        </ProtectedRoute>
                    } />

                    {/* Dashboard (Protected) */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <div className="p-10">
                                <h1 className="text-3xl font-bold">Welcome to Ribo CRM</h1>
                                <p>You are logged in!</p>
                                {/* We will add a logout button here for testing */}
                            </div>
                        </ProtectedRoute>
                    } />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
