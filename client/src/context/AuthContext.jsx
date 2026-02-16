import { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    const checkUser = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getMe();
            if (response.success && response.user) {
                setUser(response.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Error checking user:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.login(email, password);

            if (response.user) {
                setUser(response.user);
                return response;
            } else {
                throw new Error('Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout error:', err);
            // Still clear user and redirect even if API call fails
            setUser(null);
            window.location.href = '/login';
        }
    };

    /**
     * Register new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    const register = async (email, password, name) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.register(email, password, name);
            return response;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,
            register,
            loading,
            error,
            checkUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
