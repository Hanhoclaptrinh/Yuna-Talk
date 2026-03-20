import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }
    setLoading(true);
    setError('');
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden relative p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass p-8 rounded-3xl z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-500/30"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Đăng ký tham gia</h1>
          <p className="text-slate-400">Khám phá thế giới kết nối cùng Yuna Talk</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Tên đăng nhập</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                name="username"
                type="text"
                className="input-field pl-12"
                placeholder="Nhập tên đăng nhập của bạn..."
                onChange={inputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                name="email"
                type="email"
                className="input-field pl-12"
                placeholder="example@gmail.com"
                onChange={inputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Mật khẩu</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                name="password"
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                onChange={inputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">Xác nhận mật khẩu</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                name="confirmPassword"
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                onChange={inputChange}
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
            className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2 group bg-accent-600 hover:bg-accent-500 shadow-accent-600/20"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Tham gia ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium hover:underline underline-offset-4 transition-all">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
