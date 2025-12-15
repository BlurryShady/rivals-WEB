import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/team-builder');
    } else {
      setError(result.error.non_field_errors?.[0] || 'Login failed');
    }
    
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="glass p-8 rounded-2xl">
        <h1 className="text-3xl font-bold gold-text mb-6 text-center">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#E8E6E3] mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1612] border border-[#D4AF37]/20 text-[#E8E6E3] focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E8E6E3] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#1A1612] border border-[#D4AF37]/20 text-[#E8E6E3] focus:outline-none focus:border-[#D4AF37]"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#8B7355]/20 border border-[#8B7355] text-[#8B7355] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full btn-gold font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-[#9B8B7E] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#D4AF37] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;