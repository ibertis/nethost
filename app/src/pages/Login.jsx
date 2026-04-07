import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      // On success, onAuthStateChange fires → AuthContext updates → App re-renders to wizard
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link, then sign in.');
        setMode('login');
      }
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a password reset link.');
      }
    }

    setLoading(false);
  }

  function switchMode(next) {
    setMode(next);
    setError('');
    setMessage('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050914]">
      {/* Background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="https://nethost.co" className="inline-block mb-6">
            <img src="/nethost-logo.png" alt="NETHOST" className="h-7 w-auto mx-auto" />
          </a>
          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === 'login'
              ? 'Sign in to manage your website'
              : mode === 'signup'
              ? 'Start your website journey today'
              : 'Enter your email and we\'ll send a reset link'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.05] border border-white/[0.08] text-slate-100 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-500 font-medium">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-slate-100 placeholder-slate-600 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-500 transition"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-sm text-emerald-400">
                {message}
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
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                  Sign up
                </button>
              </>
            ) : (
              <button onClick={() => switchMode('login')} className="text-cyan-400 hover:text-cyan-300 font-medium transition">
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          <a href="https://nethost.co" className="hover:text-slate-500 transition">← Back to nethost.co</a>
        </p>
      </div>
    </div>
  );
}
