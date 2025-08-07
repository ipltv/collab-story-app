import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../store/userSlice';
import { type AppDispatch, type RootState } from '../store/store';
export default function LoginPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        dispatch(loginUser({ username, password }));
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/stories'); // или куда надо
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>

            <input
                className="input input-bordered w-full mb-2"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                type="password"
                className="input input-bordered w-full mb-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button
                className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                onClick={handleLogin}
                disabled={loading}
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
