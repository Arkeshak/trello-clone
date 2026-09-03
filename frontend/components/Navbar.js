import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Task<span>Board</span>
      </div>
      {user && (
        <div className="navbar-right">
          <div className="navbar-user">
            <span>{user.username}</span>
            <span className={`badge ${user.role === 'admin' ? 'admin' : ''}`}>
              {user.role}
            </span>
          </div>
          <button id="logout-btn" className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
