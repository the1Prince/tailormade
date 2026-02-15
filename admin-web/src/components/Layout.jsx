import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-luxury-white flex flex-col">
      <header className="border-b border-luxury-gray/20 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-luxury-black hover:opacity-80">
            <Logo className="w-8 h-8" />
            <span className="font-semibold text-lg tracking-tight">TailorMade Admin</span>
          </NavLink>
          <nav className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-luxury-black border-b-2 border-luxury-black' : 'text-luxury-gray hover:text-luxury-black'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `font-medium ${isActive ? 'text-luxury-black border-b-2 border-luxury-black' : 'text-luxury-gray hover:text-luxury-black'}`
              }
            >
              Users
            </NavLink>
            <span className="text-luxury-gray text-sm">{user?.username || user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-luxury-gray hover:text-luxury-black"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
