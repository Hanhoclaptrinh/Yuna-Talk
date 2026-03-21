import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User, MessageCircle, Phone, Video, Info, MoreVertical, Paperclip, Smile, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/api';
import { Message, Conversation } from '../types';

interface ChatAreaProps {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversations, setConversations }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c.id === id);
  const otherParticipant = conversation?.participants.find(p => p.user.id !== user?.id)?.user;
  const chatName = conversation?.isGroup ? (conversation.name || 'Nhóm') : (otherParticipant?.username || 'Bạn bè');

  useEffect(() => {
    if (id) {
      fetchMessages();
      if (socket) {
        socket.emit('join_conversation', id);
      }
    }
  }, [id, socket]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: Message) => {
        if (message.conversationId === id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      };

      const handleMessageRevoked = (payload: { msgId: string, revokedAt: string }) => {
        setMessages(prev => prev.map(msg => 
          msg.id === payload.msgId 
            ? { ...msg, isRevoked: true, content: 'Tin nhắn đã bị thu hồi' } 
            : msg
        ));
      };

      socket.on('new_message', handleNewMessage);
      socket.on('message_revoked', handleMessageRevoked);
      return () => { 
        socket.off('new_message', handleNewMessage);
        socket.off('message_revoked', handleMessageRevoked);
      };
    }
  }, [socket, id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/messages/${id}`);
      setMessages(res.data); // Backend returns in ascending order (oldest to newest)
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    
    socket.emit('send_message', {
      conversationId: id,
      content: text,
      type: 'TEXT'
    });
    setText('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleRevoke = (msgId: string) => {
    if (!socket || !id) return;
    socket.emit('revoke_message', { msgId, conId: id });
  };

  const handleDelete = async (msgId: string) => {
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      console.error('Lỗi khi xóa tin nhắn:', err);
    }
  };

  if (!id) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors duration-300">
      <MessageCircle className="w-20 h-20 mb-6 opacity-10 animate-float" />
      <h3 className="text-xl font-medium">Bắt đầu trò chuyện ngay</h3>
      <p className="max-w-xs text-center text-sm mt-2 opacity-60">Chọn một cuộc hội thoại từ danh sách hoặc tìm kiếm bạn bè của bạn.</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full transition-colors duration-300">
      {/* Chat Header */}
      <header className="h-20 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/30 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center overflow-hidden">
               {otherParticipant?.avatar ? <img src={otherParticipant.avatar} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-white uppercase">{chatName.charAt(0)}</span>}
            </div>
            {!conversation?.isGroup && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white dark:border-slate-900 shadow-sm ${
                otherParticipant?.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-500'
              }`} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight leading-none mb-1">{chatName}</h3>
            {!conversation?.isGroup && (
              <p className={`text-xs font-semibold tracking-wide flex items-center gap-1.5 uppercase ${
                otherParticipant?.status === 'ONLINE' ? 'text-emerald-500' : 'text-slate-500'
              }`}>
                {otherParticipant?.status === 'ONLINE' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />}
                {otherParticipant?.status === 'ONLINE' ? 'Đang hoạt động' : 'Ngoại tuyến'}
              </p>
            )}
            {conversation?.isGroup && (
              <p className="text-xs text-slate-500 font-medium lowercase">
                {conversation.participants.length} thành viên
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
           <button className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90"><Phone className="w-5 h-5" /></button>
           <button className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400 transition-all active:scale-90"><Video className="w-5 h-5" /></button>
           <button className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-primary-600 dark:hover:text-primary-400 border border-transparent transition-all active:scale-90"><Info className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Messages View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === user?.id;
            const isRevoked = msg.isRevoked;
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={msg.id}
                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 group max-w-[85%]">
                  {isMine && !isRevoked && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity order-1">
                      <button 
                        onClick={() => handleRevoke(msg.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                        title="Thu hồi"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Xóa phía tôi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className={`relative ${isMine ? 'chat-bubble-mine order-2' : 'chat-bubble-theirs order-1'} ${isRevoked ? 'opacity-50 italic' : ''}`}>
                    <p className="text-[14px] leading-relaxed py-0.5">
                      {isRevoked ? (isMine ? 'Bạn đã thu hồi tin nhắn' : 'Tin nhắn đã được thu hồi') : msg.content}
                    </p>
                    <span className={`absolute bottom-[-20px] ${isMine ? 'right-0' : 'left-0'} text-[9px] text-slate-500 uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {!isMine && !isRevoked && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity order-2">
                      <button 
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                        title="Xóa phía tôi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 bg-white/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800/50">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 glass p-1.5 rounded-2xl relative">
          <button type="button" className="p-3 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex-shrink-0 transition-colors"><Paperclip className="w-5 h-5" /></button>
          <textarea
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none py-3 px-1 text-sm text-slate-700 dark:text-slate-200 resize-none min-h-[44px] max-h-[120px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Viết lời nhắn gửi yêu thương..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <div className="relative" ref={pickerRef}>
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-3 transition-colors ${showEmojiPicker ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
            >
              <Smile className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-4 z-50 shadow-2xl"
                >
                  <EmojiPicker 
                    theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={handleEmojiClick}
                    lazyLoadEmojis={true}
                    width={320}
                    height={400}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-600/20 disabled:opacity-40 transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
