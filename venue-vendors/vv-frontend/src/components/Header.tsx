import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <Link to="/" className="text-2xl font-bold text-amber-400">VenueVendors</Link>
      <nav className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <span className="text-gray-300 text-sm">
              Welcome, <span className="text-amber-400 font-semibold">{user?.name}</span>
            </span>
            {user?.role === 'hirer' && (
              <Link to="/hirer" className="hover:text-amber-400 transition">Dashboard</Link>
            )}
            {user?.role === 'vendor' && (
              <Link to="/vendor" className="hover:text-amber-400 transition">Dashboard</Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-amber-400 transition">Login</Link>
            <Link to="/signup" className="bg-amber-500 hover:bg-amber-600 px-4 py-1.5 rounded text-sm transition">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}