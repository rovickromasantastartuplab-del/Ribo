import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validToken, setValidToken] = useState(false);
    const navigate = useNavigate();

    // Check for valid session from reset link
    useEffect(() => {
        const checkSession = async () => {
            try {
                // First, try to get existing session
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (data?.session) {
                    // Valid session exists
                    console.log('✅ Valid session found for password reset');
                    setIsValidLink(true);
                    await supabase.auth.setSession(data.session);
                    return;
                }

                // No session - extract tokens from URL hash
                const hash = window.location.hash.startsWith('#')
                    ? window.location.hash.substring(1)
                    : window.location.hash;
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                const type = params.get('type');

                if (accessToken && type === 'recovery') {
                    console.log('✅ Found recovery token in URL hash');
                    setValidToken(true);

                    // Set the session with the tokens from URL
                    if (refreshToken) {
                        try {
                            await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken
                            });

                            // 🔒 Security: Clear the hash from URL to prevent token exposure
                            window.history.replaceState(null, '', window.location.pathname);
                        } catch (e) {
                            console.warn('setSession from hash failed:', e);
                        }
                    }
                } else {
                    console.error('❌ No valid session or recovery token found');
                    setError('Invalid or expired reset link. Please request a new password reset.');
                }
            } catch (err) {
                console.error('❌ Session check error:', err);
                setError('Invalid or expired reset link. Please request a new password reset.');
            }
        };

        checkSession();
    }, []);

    // Password strength indicators
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    useEffect(() => {
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Password reset!</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Your password has been successfully reset.
                        </p>
                        <p className="mt-4 text-xs text-gray-500">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if token is invalid
    if (!validToken && error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <XCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {error}
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Request New Reset Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show loading while checking token
    if (!validToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your new password below
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                New password
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="New password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm password
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Password strength indicators */}
                    {password && (
                        <div className="bg-gray-50 p-3 rounded-md space-y-2">
                            <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                            <div className="space-y-1">
                                <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                                <PasswordRequirement met={passwordStrength.hasUpperCase} text="One uppercase letter" />
                                <PasswordRequirement met={passwordStrength.hasLowerCase} text="One lowercase letter" />
                                <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                                <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PasswordRequirement = ({ met, text }) => (
    <div className="flex items-center text-xs">
        {met ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
        ) : (
            <XCircle className="h-4 w-4 text-gray-300 mr-2" />
        )}
        <span className={met ? 'text-green-700' : 'text-gray-500'}>{text}</span>
    </div>
);

export default ResetPassword;
