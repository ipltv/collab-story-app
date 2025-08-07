import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../store/userSlice";
import { type AppDispatch, type RootState } from "../store/store";

export default function RegisterPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!validateEmail(email)) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        dispatch(registerUser({ username, email, password }));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/stories');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Creatre account
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error || localError && (
                        <p className="text-red-500 text-sm text-center">
                            {error || localError}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-6 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                    >
                        {loading ? 'Creating...' : 'Register'}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Do you already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Sing in
                    </Link>
                </div>
            </div>
        </div>
    );
}