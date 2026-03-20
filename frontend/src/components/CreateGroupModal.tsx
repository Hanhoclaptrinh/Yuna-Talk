import React, { useState, useEffect } from 'react';
import { X, Search, User, Check, Users as UsersIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { User as UserType } from '../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (convo: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await api.get(`/users/search?identity=${searchTerm}`);
          const results = Array.isArray(res.data) ? res.data : [res.data];
          setSearchResults(results.filter(u => u && u.id));
        } catch (err) {
          setSearchResults([]);
        }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const toggleUser = (user: UserType) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return setError('Vui lòng nhập tên nhóm');
    if (selectedUsers.length < 2) return setError('Nhóm phải có ít nhất 3 thành viên (bao gồm cả bạn)');
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/conversations', {
        name: groupName,
        isGroup: true,
        participantIds: selectedUsers.map(u => u.id)
      });
      onSuccess(res.data);
      onClose();
      // Reset
      setStep(1);
      setGroupName('');
      setSelectedUsers([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg glass rounded-[32px] overflow-hidden border border-slate-700/50 shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-600/20 rounded-2xl text-primary-400">
                 <UsersIcon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Tạo nhóm mới</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <div className="p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 flex-1 flex flex-col"
              >
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Tìm kiếm thành viên</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-primary-400" />
                      <input 
                        className="input-field pl-12" 
                        placeholder="Nhập tên hoặc email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map(user => (
                        <div 
                          key={user.id} 
                          onClick={() => toggleUser(user)}
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer border transition-all ${selectedUsers.find(u => u.id === user.id) ? 'bg-primary-600/10 border-primary-500/30' : 'bg-slate-800/30 border-transparent hover:border-slate-700'}`}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-500" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white leading-tight">{user.username}</p>
                                <p className="text-[11px] text-slate-500 font-medium">{user.email}</p>
                              </div>
                           </div>
                           <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${selectedUsers.find(u => u.id === user.id) ? 'bg-primary-600 border-primary-500' : 'border-slate-700'}`}>
                              {selectedUsers.find(u => u.id === user.id) && <Check className="w-3 h-3 text-white" />}
                           </div>
                        </div>
                      ))
                    ) : searchTerm.trim().length >= 2 ? (
                      <p className="text-center text-slate-500 mt-10 text-sm">Không tìm thấy người dùng nào...</p>
                    ) : (
                      <div className="text-center text-slate-600 mt-10 flex flex-col items-center gap-2">
                         <span className="text-xs font-medium uppercase tracking-[0.2em]">Cần chọn ít nhất 2 thành viên</span>
                         <p className="text-[10px] opacity-60 max-w-[200px]">Hãy tìm kiếm và thêm những cá nhân xuất sắc vào nhóm của mình!</p>
                      </div>
                    )}
                 </div>

                 {selectedUsers.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/50">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Đã chọn ({selectedUsers.length})</p>
                       <div className="flex flex-wrap gap-2">
                          {selectedUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-2 bg-primary-600/20 text-primary-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-primary-500/20">
                               {u.username}
                               <button onClick={() => toggleUser(u)} className="p-0.5 hover:text-white"><X className="w-3 h-3" /></button>
                            </div>
                          ))}
                       </div>
                    </div>
                 )}
                 
                 <button 
                   disabled={selectedUsers.length < 2}
                   onClick={() => setStep(2)}
                   className="btn-primary w-full py-4 mt-auto flex items-center justify-center gap-2 group"
                 >
                    Tiếp tục <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 py-4"
              >
                 <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-800 rounded-[32px] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500 group cursor-pointer hover:border-primary-500 hover:text-primary-400 transition-all mb-4">
                       <UsersIcon className="w-8 h-8" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Ảnh nhóm</span>
                    </div>
                    <div className="w-full text-center">
                       <h3 className="text-xl font-bold text-white mb-6">Thiết lập thông tin nhóm</h3>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Tên nhóm</label>
                    <input 
                      autoFocus
                      className="input-field py-4 text-center text-lg font-bold" 
                      placeholder="Nhập tên nhóm của bạn..." 
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                 </div>

                 {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                 <div className="flex gap-4 pt-6">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white font-bold transition-all">Quay lại</button>
                    <button 
                      onClick={handleCreate} 
                      disabled={loading || !groupName.trim()}
                      className="flex-[2] btn-primary py-4 font-bold"
                    >
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Tạo nhóm ngay'}
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
