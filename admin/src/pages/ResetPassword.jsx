import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const t = searchParams.get('token');
        if (!t) {
            setError('Invalid or missing reset link.');
        } else {
            setToken(t);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, newPassword, confirmPassword);
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2500);
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
            <div className="w-full max-w-md bg-white border border-gray-200 p-10 rounded-3xl shadow-lg">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <img src="/SC_logo.png" alt="Logo" className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">Setup New Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">Create a strong password for your account</p>
                </div>

                {message && (
                    <div className="bg-green-50 text-green-700 border border-green-100 p-6 rounded-2xl mb-6 text-sm text-center">
                        <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="font-semibold text-base">{message}</p>
                        <p className="text-green-600 mt-1">Redirecting you to login...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex flex-col">
                        <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <span>{error}</span>
                        </div>
                        {!token && (
                            <div className="mt-2 ml-7">
                                <Link to="/login" className="text-black hover:underline font-medium">Return to Login</Link>
                            </div>
                        )}
                    </div>
                )}

                {!message && token && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type= 'password'
                                placeholder="••••••••"
                                maxLength={30}
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={ showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    maxLength={30}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition duration-200 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                                >
                                    {showPassword ? <AiFillEyeInvisible size={20} /> : <AiFillEye size={20} /> } 
                                </button>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;