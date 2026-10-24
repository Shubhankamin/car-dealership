import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="bg-slate-900 text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          AutoStock
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {isAdmin && (
            <Link to="/admin" className="hover:text-indigo-300">
              Manage inventory
            </Link>
          )}
          <span className="hidden text-slate-400 sm:inline">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-700 px-3 py-1 hover:bg-slate-600"
          >
            Log out
          </button>
        </div>
      </nav>
    </header>
  );
}
