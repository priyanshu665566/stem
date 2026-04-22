import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

function Register() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await registerUser(email);
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundImage: "url('/bg-image.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }} className="min-h-screen flex items-center justify-center p-4 font-sans text-gray-900">
            <div className="w-full max-w-md bg-white border border-gray-200 p-10 rounded-3xl shadow-sm">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <img src="/SC_logo.png" alt="Logo" className="w-10 h-10" loading="lazy" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Create Account</h2>
                    <p className="text-gray-500 mt-2 text-sm">Register for the CMS Admin Panel</p>
                </div>

                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center border border-red-100">
                        <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            placeholder="admin@example.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition duration-200"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-black font-medium hover:underline">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;