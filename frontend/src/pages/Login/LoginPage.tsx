import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { login as loginApi } from '../../api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@fcbayern.de');
  const [password, setPassword] = useState('Bayern2024!');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginApi(email, password);
      const { accessToken, refreshToken, userId, fullName, role } = res.data;
      login(accessToken, refreshToken, { userId, email, fullName, role });
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-bayern-red/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-bayern-blue/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-bayern-red/5 to-transparent rounded-full" />
      </div>

      <div className="w-full max-w-md animate-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-bayern-red to-bayern-red-dark shadow-glow-red mb-6">
            <span className="text-white font-black text-3xl">FC</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            FC Bayern <span className="text-gradient">Intelligence</span>
          </h1>
          <p className="text-bayern-text-secondary text-sm">
            Professional Football Club Management Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-card">
          <h2 className="text-lg font-bold text-white mb-6">Sign In to Your Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-bayern-text-secondary mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@fcbayern.de"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-bayern-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bayern-text-muted hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-btn"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-bayern-text-muted mb-3 font-medium uppercase tracking-wider">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Club Owner', email: 'admin@fcbayern.de' },
                { label: 'Analyst', email: 'analyst@fcbayern.de' },
                { label: 'Director', email: 'director@fcbayern.de' },
                { label: 'Finance', email: 'finance@fcbayern.de' },
              ].map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword('Bayern2024!'); }}
                  className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <div className="text-xs font-medium text-white">{acc.label}</div>
                  <div className="text-xs text-bayern-text-muted truncate">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
