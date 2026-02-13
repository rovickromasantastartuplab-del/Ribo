import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import api from '../../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!formData.agreeTerms) {
            setError('You must agree to the Terms and Conditions');
            return;
        }

        setLoading(true);
        try {
            // 1. Client-side registration with Supabase
            const { data, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name
                    }
                }
            });

            if (authError) throw authError;

            // 2. With email confirmation enabled:
            //    - data.session will be NULL (user must confirm email first)
            //    - After confirmation, user logs in → login flow completes registration
            if (data.session) {
                // Email confirmation is disabled — complete registration immediately
                const { access_token, refresh_token } = data.session;

                // Complete registration (create company, user, role, etc.)
                await api.post('/registration/complete', {
                    access_token,
                    refresh_token,
                    name: formData.name,
                    email: formData.email
                });

                // Set HTTP-only cookies via backend
                const response = await api.post('/auth/login', {
                    access_token,
                    refresh_token
                });

                setUser(response.data.user);

                const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
                if (supabaseKey) localStorage.removeItem(supabaseKey);

                navigate('/');
            } else {
                // Email confirmation is enabled — show confirmation message
                navigate('/login', {
                    state: { message: 'Registration successful! Please check your email to confirm your account.' }
                });
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || err.response?.data?.error || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your details below to get started
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">

                        {/* Full Name */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Confirm your password"
                            />
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-center">
                        <input
                            id="agreeTerms"
                            name="agreeTerms"
                            type="checkbox"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                            I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a>
                        </label>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create account'}
                        </button>
                    </div>

                    <div className="text-sm text-center">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
