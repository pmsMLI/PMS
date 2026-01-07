import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* BRAND PANEL */}
      <div className="flex items-center justify-center
        h-1/3 lg:h-auto
        lg:w-1/2
        bg-gradient-to-br from-[#1E3A8A] to-[#1D4ED8]
        text-white
      ">
        <div className="text-center px-6">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-wide">
            PMS
          </h1>
          <p className="mt-3 text-lg sm:text-xl opacity-90">
            Plant Monitoring System
          </p>
        </div>
      </div>

      {/* LOGIN PANEL */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-10 bg-background">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-5"
        >
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Welcome to PMS
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to continue
            </p>
          </div>

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-primary text-white font-medium transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
