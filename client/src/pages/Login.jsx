import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bus, MapPin, ShieldCheck, Activity, UserPlus, LogIn, GraduationCap, Car } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

const Login = ({ setUser }) => {
  const [role, setRole] = useState(''); // 'student' or 'driver'
  const [isLogin, setIsLogin] = useState(true); // true for Login, false for Signup
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup form state
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Forgot Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/api/auth/login`, { 
          email, 
          password, 
          role 
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate(`/${res.data.user.role}`);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const res = await axios.post(`${API_BASE}/api/auth/signup`, { 
          name, 
          usn, 
          email, 
          phone, 
          password, 
          role 
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate(`/${res.data.user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/auth/reset-password`, { email: resetEmail, newPassword });
      setResetSuccess(res.data.message);
      setIsForgotPassword(false);
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    }
  };

  const renderRoleSelection = () => (
    <div className="flex flex-col gap-6 items-center w-full">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Select Your Role</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <button 
          onClick={() => setRole('student')}
          className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group"
        >
          <GraduationCap size={40} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-md">Student</span>
        </button>
        <button 
          onClick={() => { setRole('driver'); setIsLogin(true); }}
          className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group"
        >
          <Car size={40} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-md">Driver</span>
        </button>
        <button 
          onClick={() => { setRole('admin'); setIsLogin(true); }}
          className="glass-card p-4 flex flex-col items-center gap-3 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group"
        >
          <ShieldCheck size={40} className="text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-md">Admin</span>
        </button>
      </div>
    </div>
  );

  const renderAuthForm = () => (
    <div className="w-full relative z-10">
      <button 
        onClick={() => { 
          if (isForgotPassword) { setIsForgotPassword(false); setError(''); setResetSuccess(''); }
          else { setRole(''); setError(''); setResetSuccess(''); }
        }}
        className="text-sm text-indigo-400 hover:text-indigo-300 mb-6 flex items-center gap-1"
      >
        ← {isForgotPassword ? 'Back to Login' : 'Back to Roles'}
      </button>

      <h2 className="text-2xl font-bold mb-2 text-center">
        {isForgotPassword ? 'Reset Password' : role === 'student' ? (isLogin ? 'Student Login' : 'Create Student Account') : role === 'driver' ? 'Driver Login' : 'Admin Login'}
      </h2>
      {!isForgotPassword && (
        <p className="text-slate-400 text-center mb-6 text-sm">
          {role === 'driver' && 'Drivers cannot create accounts. Please login with admin-assigned credentials.'}
          {role === 'admin' && 'Admin portal is restricted to authorized personnel only.'}
        </p>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
          {error}
        </div>
      )}
      
      {resetSuccess && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg mb-6 text-sm text-center">
          {resetSuccess}
        </div>
      )}

      {isForgotPassword ? (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Account Email</label>
            <input 
              type="email" 
              className="glass-input w-full" 
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <input 
              type="password" 
              className="glass-input w-full" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              className="glass-input w-full" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary mt-4 w-full">
            Reset Password
          </button>
        </form>
      ) : (
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
        {!isLogin && role === 'student' && (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" className="glass-input w-full" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">USN / Student ID</label>
              <input type="text" className="glass-input w-full" value={usn} onChange={(e) => setUsn(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <input type="tel" className="glass-input w-full" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email or ID</label>
          <input 
            type="email" 
            className="glass-input w-full" 
            placeholder={role === 'student' ? 'student@sdmcet.ac.in' : role === 'driver' ? 'driver@sdmcet.ac.in' : 'admin@sdmcet.ac.in'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input 
            type="password" 
            className="glass-input w-full" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLogin && role === 'student' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input 
              type="password" 
              className="glass-input w-full" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button type="submit" className="btn-primary mt-4 w-full">
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
        
        {isLogin && (
          <div className="text-center mt-2">
            <button 
              type="button"
              onClick={() => { setIsForgotPassword(true); setError(''); setResetSuccess(''); }}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}
      </form>
      )}

      {role === 'student' && !isForgotPassword && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); setResetSuccess(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left Side Branding */}
        <div className="hidden md:flex flex-col space-y-6">
          <div className="flex items-center gap-3 text-indigo-400">
            <Bus size={40} className="live-indicator" />
            <h1 className="text-4xl font-bold text-white tracking-tight">SDMCET Tracker</h1>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md">
            Next-generation intelligent transit system. Real-time GPS tracking, AI-driven ETA, and seamless ride experiences.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="glass-card p-4 flex flex-col items-center gap-2">
              <MapPin className="text-emerald-400" />
              <span className="text-sm font-medium">Live Tracking</span>
            </div>
            <div className="glass-card p-4 flex flex-col items-center gap-2">
              <Activity className="text-indigo-400" />
              <span className="text-sm font-medium">AI Routing</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="glass-card p-8 md:p-10 w-full max-w-md mx-auto relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl" />
          
          {!role ? renderRoleSelection() : renderAuthForm()}

        </div>
      </div>
    </div>
  );
};

export default Login;
