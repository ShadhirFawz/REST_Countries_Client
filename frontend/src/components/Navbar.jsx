import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        CountryExplorer
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/favorites" className="hover:underline">Favorites</Link>
            <Link to="/notes" className="hover:underline">Notes</Link>
            <Link to="/recent" className="hover:underline">Recent</Link>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
