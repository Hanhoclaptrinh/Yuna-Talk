import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Search, User, MessageCircle, Clock, Users as UsersIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '../types';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from './CreateGroupModal';

interface ChatListProps {
  conversations: Conversation[];
  loading: boolean;
  refreshConversations: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, loading, refreshConversations }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredConvos = conversations.filter(c => {
    const otherParticipant = c.participants.find(p => p.user.id !== user?.id)?.user;
    const name = c.isGroup ? (c.name || 'Nhóm') : (otherParticipant?.username || 'Người dùng');
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/30">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Trò chuyện</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-primary-400 rounded-xl transition-all active:scale-90 border border-slate-700/50 group"
            title="Tạo nhóm mới"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm cuộc hội thoại..."
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={refreshConversations} 
      />

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredConvos.length === 0 ? (
          <div className="mt-20 text-center px-4">
            <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-20" />
            <p className="text-slate-500 text-sm">Chưa có liên hệ nào.</p>
            <p className="text-slate-600 text-xs">Hãy tìm kiếm bạn bè để bắt đầu!</p>
          </div>
        ) : (
          filteredConvos.map((convo, idx) => {
            const otherParticipant = convo.participants.find(p => p.user.id !== user?.id)?.user;
            const name = convo.isGroup ? (convo.name || 'Nhóm') : (otherParticipant?.username || 'Bạn bè');
            const lastMsg = convo.messages?.[0]?.content;
            
            return (
              <NavLink
                to={`/dashboard/chat/${convo.id}`}
                key={convo.id}
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer border border-transparent ${isActive ? 'bg-primary-600/10 border-primary-500/20' : 'hover:bg-slate-800/50'}`
                }
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {otherParticipant?.avatar ? (
                      <img src={otherParticipant.avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white uppercase tracking-tighter">
                        {name.charAt(0)}
                      </span>
                    )}
                  </div>
                  {/* Status Indicator */}
                  {!convo.isGroup && (
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-slate-950 shadow-sm ${
                      otherParticipant?.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`text-sm font-semibold truncate ${idx < 3 ? 'text-white' : 'text-slate-200'}`}>{name}</h4>
                    <span className="text-[10px] text-slate-500 font-medium">12:30</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate font-normal">
                    {lastMsg || 'Chưa có lời chào nào...'}
                  </p>
                </div>
              </NavLink>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
