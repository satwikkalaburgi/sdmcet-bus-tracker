import { Bus, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  return (
    <nav className="glass-card m-4 px-6 py-4 flex justify-between items-center z-50 relative">
      <div className="flex items-center gap-2 text-indigo-400">
        <Bus size={28} className="live-indicator" />
        <span className="font-bold text-xl text-white hidden sm:block">SDMCET Tracker</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="bg-slate-700/50 p-2 rounded-full">
            <User size={18} />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-semibold text-white">{user?.name}</span>
            <span className="text-xs text-indigo-400 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
