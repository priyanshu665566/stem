import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, forgotPassword } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalEmail, setModalEmail] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await loginUser(email, password);
            // Use AuthContext login method to handle storage
            login(res.data);
            // Navigate based on role
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        setModalMessage('');
        try {
            const res = await forgotPassword(modalEmail);
            setModalMessage(res.data.message);
            setModalEmail('');
        } catch (err) {
            setModalError(err.response?.data?.error || 'Something went wrong');
        } finally {
            setModalLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setModalEmail('');
        setModalMessage('');
        setModalError('');
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
                        <img src="/SC_logo.png" alt="Logo" className="w-10 h-10" loading="lazy" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Management System <span className="font-semibold">Login</span></h2>
                    <p className="text-gray-500 text-sm mt-3">Sign in to manage your CMS</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center border border-red-100">
                        <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition duration-200"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <button 
                                type="button"
                                onClick={() => setShowModal(true)} 
                                className="text-sm text-gray-500 hover:text-black transition-colors cursor-pointer"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                maxLength={30}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-black font-medium hover:underline">
                        Register
                    </Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white border border-gray-200 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative animate-fade-in-up">
                        <button 
                            onClick={closeModal} 
                            className="absolute top-5 right-5 text-gray-400 hover:text-black transition"
                        >
                            <svg className="w-5 h-5 hover: cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="mb-6 mt-2">
                           <h3 className="text-xl font-semibold text-gray-900">Reset Password</h3>
                           <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send a link to reset your password.</p>
                        </div>

                        {modalMessage && (
                            <div className="bg-gray-50 text-gray-900 p-4 rounded-xl mb-4 text-sm font-medium">
                                {modalMessage}
                            </div>
                        )}
                        {modalError && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
                                {modalError}
                            </div>
                        )}
                        
                        {!modalMessage && (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <input 
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={modalEmail}
                                        onChange={e => setModalEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition duration-200"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={modalLoading}
                                    className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl shadow-sm transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {modalLoading ? 'Sending...' : 'Send Link'}
                                </button>
                            </form>
                        )}

                        {modalMessage && (
                            <button 
                                onClick={closeModal}
                                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-xl transition duration-200 cursor-pointer"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;
