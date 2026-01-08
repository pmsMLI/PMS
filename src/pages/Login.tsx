import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Mail, 
  Lock, 
  Loader2, 
  Moon, 
  Sun, 
  CheckCircle2 
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle Theme Logic
  useEffect(() => {
    // Check local storage or system preference on mount
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

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
    <div className="min-h-screen flex w-full bg-gray-50 dark:bg-[#09090b] transition-colors duration-300">
      
      {/* LEFT PANEL - BRANDING (Hidden on mobile, block on lg) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#121212] items-center justify-center p-12">
        {/* Abstract Background Design matching dashboard vibes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#1d4ed8_0%,#000000_50%)] opacity-40"></div>
          <div className="absolute top-0 right-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="relative z-10 text-left space-y-6 max-w-lg">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 mb-4">
               <LayoutDashboard className="h-8 w-8 text-blue-500" />
            </div>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Plant Monitoring <br />
            <span className="text-blue-500">System</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Real-time production tracking, OEE analysis, and efficiency metrics at your fingertips.
          </p>
          
          {/* Mock Stats to mirror the dashboard feel */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-sm text-gray-400">System Status</div>
                <div className="flex items-center gap-2 mt-1 text-green-400 font-semibold">
                    <CheckCircle2 size={16} /> Operational
                </div>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-sm text-gray-400">Last Update</div>
                <div className="mt-1 text-gray-200 font-mono text-sm">12:24:17 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        {/* Theme Toggle Button */}
        <button 
            onClick={toggleTheme}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Enter your credentials to access the floor dashboard.
                </p>
            </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-4">
                {/* Email Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail className="h-5 w-5" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#18181b] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="admin@factory.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock className="h-5 w-5" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-[#18181b] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
            
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
                Protected by industrial security protocols.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}