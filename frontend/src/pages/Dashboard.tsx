import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatArea from '../components/ChatArea';
import SearchView from '../components/SearchView';
import ProfileView from '../components/ProfileView';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Conversation } from '../types';

const Dashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        setConversations(prev => {
          const updated = [...prev];
          const conIndex = updated.findIndex(c => c.id === message.conversationId);
          if (conIndex > -1) {
            const con = { ...updated[conIndex] };
            con.messages = [message, ...(con.messages || [])];
            updated.splice(conIndex, 1);
            return [con, ...updated];
          }
          return prev;
        });
      });

      socket.on('status_changed', ({ userId, status }) => {
        console.log(`Status change: ${userId} is now ${status}`);
        setConversations(prev => {
          const newConvs = prev.map(con => ({
            ...con,
            participants: con.participants.map(p => 
              p.user.id === userId ? { ...p, user: { ...p.user, status } } : p
            )
          }));
          return newConvs;
        });
      });

      return () => { 
        socket.off('new_message'); 
        socket.off('status_changed');
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations/my-convos');
      const apiConvos: Conversation[] = res.data;
      
      setConversations(prev => {
        // Nếu đã có dữ liệu trước đó (và có thể đã được socket cập nhật)
        // Chúng ta sẽ giữ lại các trạng thái ONLINE hiện tại
        return apiConvos.map(newCon => {
          const oldCon = prev.find(p => p.id === newCon.id);
          if (!oldCon) return newCon;
          
          return {
            ...newCon,
            participants: newCon.participants.map(p => {
              const oldP = oldCon.participants.find(op => op.user.id === p.user.id);
              // Nếu socket đã báo online nhưng API báo offline, ta tin socket
              if (oldP?.user.status === 'ONLINE' && p.user.status !== 'ONLINE') {
                return { ...p, user: { ...p.user, status: 'ONLINE' } };
              }
              return p;
            })
          };
        });
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden transition-colors duration-300">
      {/* Mini Sidebar */}
      <Sidebar onLogout={logout} user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<ChatList conversations={conversations} loading={loading} refreshConversations={fetchConversations} />} />
          <Route path="/chat/:id" element={<ChatArea conversations={conversations} setConversations={setConversations} />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="/profile" element={<ProfileView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
