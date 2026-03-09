'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Sprout, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-soft sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-blush flex items-center justify-center">
            <Sprout size={16} className="text-rose" />
          </div>
          <span className="font-bold text-xl text-slate-dark group-hover:text-rose transition-colors">
            Micro<span className="text-rose">Intern</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/tasks"
            className="text-slate-mid hover:text-rose text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blush/50"
          >
            Browse Tasks
          </Link>

          {user ? (
            <>
              <Link
                href="/tasks/post"
                className="hidden sm:flex items-center gap-1.5 btn-primary"
              >
                <PlusCircle size={14} />
                Post Task
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-slate-mid hover:text-rose text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-lavender/50"
              >
                <LayoutDashboard size={14} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-slate-mid hover:text-red-400 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-mid hover:text-rose text-sm font-medium transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-primary"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}