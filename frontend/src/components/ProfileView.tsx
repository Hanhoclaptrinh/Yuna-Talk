import React, { useState } from 'react';
import { User, Mail, Shield, ShieldCheck, Lock, Edit3, Trash2, Camera, UserCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const ProfileView: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changePass, setChangePass] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [passData, setPassData] = useState({
    oldPass: '',
    newPass: '',
    confirmPass: '',
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/me', formData);
      updateUser(res.data);
      setMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      setEditing(false);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleChangePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirmPass) {
      return setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
    }
    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        oldPass: passData.oldPass,
        newPass: passData.newPass
      });
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setChangePass(false);
      setPassData({ oldPass: '', newPass: '', confirmPass: '' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/10 p-10 overflow-y-auto relative animate-fade-in">
       <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-accent-600/5 rounded-full blur-[120px] -z-10" />

       <div className="max-w-4xl mx-auto w-full">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">Cài đặt hồ sơ</h2>
            {!editing && !changePass && (
               <button 
                 onClick={() => setEditing(true)}
                 className="btn-primary py-3 flex items-center gap-2 group px-6"
               >
                 <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                 Sửa hồ sơ
               </button>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* User Info Column */}
            <div className="md:col-span-1 space-y-8">
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass p-8 rounded-[40px] flex flex-col items-center border border-slate-700/50 shadow-2xl">
                  <div className="relative mb-6">
                    <div className="w-40 h-40 bg-slate-700 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 drop-shadow-2xl">
                      {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full text-slate-500 p-4" />}
                    </div>
                    <button className="absolute -bottom-3 -right-3 p-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl shadow-xl transition-all active:scale-90 border-4 border-slate-900">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-white px-2 text-center uppercase tracking-tight">{user?.username}</h3>
                  <p className="text-slate-400 font-medium text-sm mt-1">{user?.email}</p>
                  
                  <div className="mt-8 flex flex-col w-full gap-3 pt-6 border-t border-slate-700/50">
                     <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-3xl">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        Trạng thái: <span className="text-white font-bold uppercase tracking-widest text-[10px]">Đã xác thực</span>
                     </div>
                  </div>
               </motion.div>
            </div>

            {/* Forms Column */}
            <div className="md:col-span-2 space-y-6">
               <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.form 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass p-8 rounded-[40px] space-y-6 border border-primary-500/20 shadow-primary-500/5"
                      onSubmit={handleUpdateProfile}
                    >
                       <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                          <User className="w-6 h-6 text-primary-400" /> 
                          Thông tin cá nhân
                       </h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                             <input className="input-field" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                             <input className="input-field" value={formData.email} disabled />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Giới thiệu (Bio)</label>
                          <textarea className="input-field min-h-[100px]" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Kể về bản thân bạn chút đi..." />
                       </div>
                       <div className="flex gap-4 pt-4">
                          <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 uppercase font-black text-xs tracking-widest">Lưu thay đổi</button>
                          <button type="button" onClick={() => setEditing(false)} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all uppercase font-black text-xs tracking-widest">Hủy</button>
                       </div>
                    </motion.form>
                  ) : changePass ? (
                    <motion.form 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="glass p-8 rounded-[40px] space-y-5 border border-accent-500/20 shadow-accent-500/5"
                      onSubmit={handleChangePass}
                    >
                       <h4 className="text-xl font-bold text-white flex items-center gap-3 mb-4">
                          <Lock className="w-6 h-6 text-accent-400" /> 
                          Đổi mật khẩu bảo mật
                       </h4>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mật khẩu cũ</label>
                          <input type="password" className="input-field" value={passData.oldPass} onChange={e => setPassData({...passData, oldPass: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                          <input type="password" className="input-field" value={passData.newPass} onChange={e => setPassData({...passData, newPass: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                          <input type="password" className="input-field" value={passData.confirmPass} onChange={e => setPassData({...passData, confirmPass: e.target.value})} />
                       </div>
                       <div className="flex gap-4 pt-4">
                          <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 bg-accent-600 hover:bg-accent-500 uppercase font-black text-xs tracking-widest">Cập nhật mật khẩu</button>
                          <button type="button" onClick={() => setChangePass(false)} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all uppercase font-black text-xs tracking-widest">Quay lại</button>
                       </div>
                    </motion.form>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                       <div className="glass p-8 rounded-[40px] border border-slate-800/50">
                          <h4 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                             <Shield className="w-6 h-6 text-primary-400" />
                             Bảo mật & Quyền riêng tư
                          </h4>
                          <div className="space-y-4">
                             <div className="flex items-center justify-between p-5 bg-slate-800/30 rounded-3xl border border-slate-700/30">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-accent-600/10 rounded-2xl">
                                      <Key className="w-5 h-5 text-accent-400" />
                                   </div>
                                   <div>
                                      <p className="text-white font-bold text-sm">Mật khẩu</p>
                                      <p className="text-slate-500 text-xs mt-0.5 font-medium">Thay đổi mật khẩu đăng nhập của bạn định kỳ</p>
                                   </div>
                                </div>
                                <button onClick={() => setChangePass(true)} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Thay đổi</button>
                             </div>
                             
                             <div className="flex items-center justify-between p-5 bg-slate-800/30 rounded-3xl border border-slate-700/30 opacity-60">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-red-600/10 rounded-2xl">
                                      <Trash2 className="w-5 h-5 text-red-400" />
                                   </div>
                                   <div>
                                      <p className="text-white font-bold text-sm">Xóa tài khoản</p>
                                      <p className="text-slate-500 text-xs mt-0.5">Tài khoản và mọi dữ liệu sẽ bị xóa hoàn toàn</p>
                                   </div>
                                </div>
                                <button disabled className="px-5 py-2.5 bg-red-900/40 text-red-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Xóa ngay</button>
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>

               {msg.text && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50' : 'bg-red-500/10 text-red-500 border border-red-500/50'}`}
                 >
                    {msg.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    {msg.text}
                 </motion.div>
               )}
            </div>
         </div>
       </div>
    </div>
  );
};

export default ProfileView;
