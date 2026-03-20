import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, UserPlus, MessageCircle, X, SearchSlash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { User as UserType } from '../types';

const SearchView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/search?identity=${searchTerm}`);
      setUsers(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (targetUser: UserType) => {
    try {
      // Check if conversation exists (backend logic handles this if we just try to create)
      const res = await api.post('/conversations', {
        participantIds: [targetUser.id],
        isGroup: false
      });
      navigate(`/dashboard/chat/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/10 p-10 animate-fade-in relative">
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary-600/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Tìm kiếm bạn bè</h2>
        <p className="text-slate-400 mb-10 font-light">Kết nối với mọi người bằng tên người dùng hoặc email.</p>
        
        <form onSubmit={handleSearch} className="mb-12 relative group">
          <Search className="absolute left-5 top-5 w-6 h-6 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-3xl py-5 pl-14 pr-6 focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none text-lg transition-all shadow-xl shadow-slate-950/20 placeholder:text-slate-600"
            placeholder="Nhập username hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            className="absolute right-3 top-3 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl transition-all shadow-lg active:scale-95"
          >
            Tìm
          </button>
        </form>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key="loading-search" 
                className="flex justify-center py-20"
              >
                <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              </motion.div>
            ) : users.length > 0 ? (
              users.map((user, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={user.id}
                  className="glass p-5 rounded-3xl flex items-center justify-between border border-slate-800 focus-within:border-primary-500/30 transition-all hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-600/50">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-slate-500" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight">{user.username}</h4>
                      <p className="text-sm text-slate-400 font-light">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => startChat(user)}
                      className="p-3 bg-primary-600/10 hover:bg-primary-600 text-primary-400 hover:text-white border border-primary-500/20 rounded-2xl transition-all active:scale-90 flex items-center gap-2 px-5 font-semibold"
                    >
                      <MessageCircle className="w-5 h-5 text-current" />
                      Nhắn tin
                    </button>
                    <button className="p-3 bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700/50 rounded-2xl transition-all active:scale-90 group">
                      <UserPlus className="w-5 h-5 group-hover:scale-110" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : searchTerm && !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-slate-800/20 rounded-[40px] border border-dashed border-slate-700"
              >
                 <SearchSlash className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-30" />
                 <p className="text-slate-500 text-lg">Không tìm thấy người dùng nào phù hợp</p>
                 <p className="text-slate-600 text-sm mt-1">Sử dụng từ khóa khác xem sao bạn nhé!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchView;
