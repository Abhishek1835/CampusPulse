import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import {
  Leaf,
  Lock,
  GraduationCap,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!usn.trim() || !password) {
      setError('Please enter both USN and password');
      return;
    }

    const cleanUsn = usn.trim().toUpperCase();

    setLoading(true);
    try {
      const user = await login({ usn: cleanUsn, password });
      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role
      const redirectPath =
        location.state?.from?.pathname ||
        (user.role === 'organizer' ? '/organizer/dashboard' : '/events');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials
  const fillCredentials = (demoUsn, demoPass) => {
    setUsn(demoUsn);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-panel-strong rounded-3xl p-6 sm:p-8 border border-[var(--border-glass)] shadow-warm-lg relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary text-[#F6F0E4] shadow-warm-sm mb-3">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-text-main">
            Welcome to CampusPulse
          </h2>
          <p className="text-xs text-text-muted mt-1.5">
            Sign in with your University Seat Number (USN)
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="University Seat Number (USN)"
            placeholder="e.g. 1BM22CS045"
            value={usn}
            onChange={(e) => setUsn(e.target.value.toUpperCase())}
            required
            autoFocus
            helperText="Format: 1BM22CS045 (VTU Standard)"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Credentials Quick-Fill Strip */}
        <div className="mt-6 pt-5 border-t border-[var(--border-glass)] space-y-2">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-center mb-2">
            🌱 Quick Test Accounts (One-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillCredentials('1BM22CS045', 'Password@123')}
              className="p-2.5 rounded-xl text-left glass-panel border border-[var(--border-glass)] hover:border-primary/40 text-xs transition-all hover:bg-primary-soft/40"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </div>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">
                1BM22CS045
              </p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('1BM22CS001', 'Password@123')}
              className="p-2.5 rounded-xl text-left glass-panel border border-[var(--border-glass)] hover:border-accent/40 text-xs transition-all hover:bg-accent-soft/40"
            >
              <div className="flex items-center gap-1.5 text-accent font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Organizer</span>
              </div>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">
                1BM22CS001 (CodeForge)
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-text-muted">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            className="font-bold text-primary hover:text-primary-hover hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
