import { useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Account({ onBack }) {
  const { user, logout } = useAuth();
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');

  async function handleChangePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <div className="min-h-screen bg-[#050914] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-white/[0.06] shrink-0">
        <a href="https://nethost.co">
          <img src="/nethost-logo.png" alt="NETHOST" className="h-6 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition text-xs"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 transition text-xs"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-10 py-10 max-w-lg mx-auto w-full">
        <h1 className="text-2xl font-black text-white mb-1">Account</h1>
        <p className="text-slate-500 text-sm mb-8">Manage your account settings.</p>

        {/* Email (read-only) */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5">
          <p className="text-xs text-slate-500 font-medium mb-1">Email address</p>
          <p className="text-white text-sm">{user?.email}</p>
        </div>

        {/* Change password */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h2 className="text-white font-bold text-sm mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white/[0.05] border border-white/[0.08] text-slate-100 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Confirm new password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className="w-full bg-white/[0.05] border border-white/[0.08] text-slate-100 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Update Password
            </button>
          </form>
        </div>
      </main>

      <footer className="border-t border-white/[0.05] py-5 text-center">
        <p className="text-slate-700 text-xs">
          <a href="https://nethost.co/terms" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 transition">Terms</a>
          <span className="mx-2">·</span>
          <a href="https://nethost.co/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 transition">Privacy</a>
          <span className="mx-2">·</span>
          <a href="mailto:hello@nethost.co" className="hover:text-slate-500 transition">hello@nethost.co</a>
        </p>
      </footer>
    </div>
  );
}
