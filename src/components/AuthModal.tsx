import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, ShieldAlert } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AUTHORIZED_ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL || '',
  'eugeniojv31@gmail.com',
  'ju27ine@gmail.com',
  'jacotradesdevs@gmail.com',
].filter(Boolean).map(e => e.toLowerCase());

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailAdmin = (userEmail?: string | null) => {
    return userEmail ? AUTHORIZED_ADMIN_EMAILS.includes(userEmail.toLowerCase()) : false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!isEmailAdmin(result.user.email)) {
        await signOut(auth);
        setError(`Access Denied: Hindi awtorisado ang account (${result.user.email}) para sa Admin Dashboard.`);
        return;
      }
      onSuccess();
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials or create this user in Firebase Console.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!isEmailAdmin(result.user.email)) {
        await signOut(auth);
        setError(`Access Denied: Ang Gmail (${result.user.email}) ay hindi kabilang sa mga Admin.`);
        return;
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-ink/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-luxury-ink/40 hover:text-luxury-gold transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-luxury-gold/10 text-luxury-gold mb-3">
                  <Lock size={28} />
                </div>
                <h2 className="text-2xl font-serif italic text-luxury-ink">Admin Access</h2>
                <p className="text-luxury-ink/60 text-xs mt-1">Sign in with Google or enter admin credentials</p>
              </div>

              {/* One-Click Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-luxury-ink/15 hover:border-luxury-gold/50 bg-white hover:bg-luxury-cream/40 text-luxury-ink font-medium text-sm transition-all shadow-sm mb-5 group disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-luxury-ink/10 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-luxury-ink/40">or email login</span>
                <div className="border-t border-luxury-ink/10 w-full" />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-luxury-ink/40 mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-ink/20" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-luxury-cream/30 border border-luxury-ink/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold/30 transition-all"
                      placeholder="admin@vonbeauty.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-luxury-ink/40 mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-ink/20" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-luxury-cream/30 border border-luxury-ink/5 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold/30 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                    <ShieldAlert size={16} className="shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-ink text-white py-4 rounded-xl font-serif italic text-lg hover:bg-luxury-gold transition-all duration-500 shadow-lg shadow-luxury-ink/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-luxury-ink/5 text-center">
                <p className="text-luxury-ink/40 text-[10px] uppercase tracking-widest">
                  Haus of Von Beauty &copy; 2026
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
