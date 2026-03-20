import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, LogIn, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ identity, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative p-4">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Chào mừng trở lại</h1>
          <p className="text-slate-400">Đăng nhập vào tài khoản Yuna Talk của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Username hoặc Email</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="text"
                className="input-field pl-12"
                placeholder="Nhập username hoặc email..."
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Mật khẩu</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium hover:underline underline-offset-4 transition-all">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
