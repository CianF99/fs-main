import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-4 transition-colors duration-300 dark:bg-gray-950">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-400/20 blur-[100px] dark:bg-blue-600/20"></div>
        <div className="absolute left-[10%] top-[20%] h-[30%] w-[30%] rounded-full bg-violet-300/25 blur-[100px] dark:bg-purple-600/20"></div>
      </div>
      <ThemeToggle className="absolute right-4 top-4 z-20" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="z-10 w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/15 dark:bg-white/10 dark:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-purple-500/20 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">Create Account</h2>
          <p className="mt-2 text-center text-slate-600 dark:text-gray-300">Join the Smart Traffic System</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/15 p-3 text-center text-sm text-red-700 dark:text-red-200">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-400"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-gray-300">Role</label>
            <select
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-gray-800 dark:text-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="User">User</option>
              <option value="Police">Police</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-purple-500/25 transition-all flex justify-center items-center mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
