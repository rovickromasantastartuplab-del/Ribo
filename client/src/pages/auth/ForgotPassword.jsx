import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
                // 🔒 Security: Don't capture errors that might contain tokens
                captureErrors: false
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Check your email</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="mt-4 text-xs text-gray-500">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Link
                            to="/login"
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Forgot password?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        No worries! Enter your email and we'll send you a reset link.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
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
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Sending...
                                </>
                            ) : (
                                'Send reset link'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="font-medium text-indigo-600 hover:text-indigo-500 text-sm flex items-center justify-center"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
