import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Building2, Loader2, CheckCircle } from 'lucide-react';

const CreateCompany = () => {
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!companyName.trim()) return;

        setLoading(true);
        setError('');

        try {
            // Call the Backend Onboarding API
            const response = await api.post('/companies', {
                name: companyName
            });

            console.log('Onboarding Success:', response.data);

            // Redirect to Dashboard
            // Might need to refresh user context? For now just redirect.
            navigate('/');
            // Force reload to update AuthContext with new CompanyId/Role if needed? 
            // Better: Context should update. But reload is safer for MVP.
            window.location.reload();

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create company');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-lg w-full bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Name your Company</h2>
                    <p className="mt-2 text-gray-600">
                        This will be your shared workspace. You can change it later.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                            Company / Workspace Name
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g. Acme Corp, Ribo Tech, My Design Studio"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Setting up your office...
                            </>
                        ) : (
                            'Create Workspace'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCompany;
