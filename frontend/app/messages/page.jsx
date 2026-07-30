'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Search, MessageCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [token, setToken] = useState('');
  const [showChat, setShowChat] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const fetchConversations = useCallback(async (tkn) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/conversations`, { headers: { Authorization: `Bearer ${tkn}` } });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchConnectedUsers = useCallback(async (tkn, currentUser) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, { headers: { Authorization: `Bearer ${tkn}` } });
      const users = res.data.map(conn => conn.senderId === currentUser.id ? conn.receiver : conn.sender);
      setConnectedUsers(users);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    const parsedUser = JSON.parse(userData || '{}');
    setUser(parsedUser);
    fetchConversations(tkn);
    fetchConnectedUsers(tkn, parsedUser);

    socketRef.current = io('http://localhost:5000', { transports: ['websocket', 'polling'], reconnection: true });
    socketRef.current.emit('join', String(parsedUser.id));
    socketRef.current.on('receiveMessage', (data) => { setMessages(prev => [...prev, data]); });
    return () => { socketRef.current?.disconnect(); };
  }, [router, fetchConversations, fetchConnectedUsers]);

  useEffect(() => {
    const urlUserId = searchParams.get('userId');
    if (urlUserId && connectedUsers.length > 0) {
      const found = connectedUsers.find(u => u.id === parseInt(urlUserId));
      if (found) { setSelectedUser(found); setShowChat(true); }
    }
  }, [searchParams, connectedUsers]);

  useEffect(() => {
    if (selectedUser && token) {
      setMsgLoading(true);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedUser.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setMessages(res.data))
        .catch(err => console.error(err))
        .finally(() => setMsgLoading(false));
    }
  }, [selectedUser, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSelectUser = (contactUser) => { setSelectedUser(contactUser); setShowChat(true); };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/messages/send`, { receiverId: selectedUser.id, content: newMessage }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, res.data]);
      socketRef.current?.emit('sendMessage', { ...res.data, receiverId: selectedUser.id });
      setNewMessage('');
      fetchConversations(token);
    } catch (err) { console.error(err); }
  };

  const convUserIds = conversations.map(c => c.user.id);
  const newUsers = connectedUsers.filter(u => !convUserIds.includes(u.id));
  const allContacts = [
    ...conversations.map(c => {
      const fullUser = connectedUsers.find(u => u.id === c.user.id) || c.user;
      return { user: fullUser, lastMessage: c.lastMessage, unread: c.unread };
    }),
    ...newUsers.map(u => ({ user: u, lastMessage: null, unread: 0 }))
  ];
  const filteredContacts = allContacts.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

  const ContactList = () => (
    <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'16px', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%'}}>
      <div style={{padding:'0.875rem 1rem', borderBottom:'1px solid rgba(34,197,94,0.12)'}}>
        <h2 style={{color:'#22c55e', fontWeight:700, fontSize:'0.95rem', marginBottom:'0.65rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
          <MessageSquare size={15}/> Messages
        </h2>
        <div style={{position:'relative'}}>
          <Search size={13} style={{position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)'}}/>
          <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" style={{paddingLeft:'2rem', fontSize:'0.8rem'}}/>
        </div>
      </div>
      <div style={{overflowY:'auto', flex:1}}>
        {loading ? (
          <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.8rem', padding:'1rem', textAlign:'center'}}>Loading...</p>
        ) : filteredContacts.length === 0 ? (
          <div style={{padding:'2rem 1rem', textAlign:'center'}}>
            <MessageCircle size={32} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.5rem', display:'block'}}/>
            <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.78rem'}}>No connections yet</p>
            <p style={{color:'rgba(255,255,255,0.15)', fontSize:'0.72rem', marginTop:'0.25rem'}}>Connect with members first</p>
          </div>
        ) : filteredContacts.map((conv) => (
          <div key={conv.user.id} onClick={() => handleSelectUser(conv.user)}
            style={{display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.75rem 1rem', cursor:'pointer', background: selectedUser?.id === conv.user.id ? 'rgba(34,197,94,0.1)' : 'transparent', borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.2s'}}>
            <Avatar user={conv.user} size={40} radius="10px"/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <p style={{fontWeight:600, color:'white', fontSize:'0.85rem'}}>{conv.user.name}</p>
                {conv.unread > 0 && <span style={{background:'#22c55e', color:'white', borderRadius:'999px', fontSize:'0.65rem', padding:'1px 6px', fontWeight:700}}>{conv.unread}</span>}
              </div>
              <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {conv.lastMessage ? conv.lastMessage.content : 'Say hi! 👋'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChatWindow = () => (
    <div style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:'16px', overflow:'hidden', display:'flex', flexDirection:'column', height:'100%'}}>
      {!selectedUser ? (
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.75rem'}}>
          <MessageSquare size={48} style={{color:'rgba(255,255,255,0.1)'}}/>
          <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.875rem'}}>Select a contact to start chatting</p>
        </div>
      ) : (
        <>
          <div style={{padding:'0.875rem 1.1rem', borderBottom:'1px solid rgba(34,197,94,0.12)', display:'flex', alignItems:'center', gap:'0.65rem', background:'rgba(34,197,94,0.05)'}}>
            <button onClick={() => setShowChat(false)} className="show-mobile"
              style={{background:'transparent', border:'none', color:'#22c55e', cursor:'pointer', padding:'0.25rem', display:'flex', alignItems:'center', marginRight:'0.1rem'}}>
              <ArrowLeft size={18}/>
            </button>
            <Avatar user={selectedUser} size={38} radius="10px"/>
            <div>
              <p style={{fontWeight:600, color:'white', fontSize:'0.875rem'}}>{selectedUser.name}</p>
              <p style={{color:'#22c55e', fontSize:'0.7rem'}}>● Connected</p>
            </div>
          </div>

          <div style={{flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.6rem', background:'rgba(0,0,0,0.1)'}}>
            {msgLoading ? (
              <p style={{color:'rgba(255,255,255,0.3)', textAlign:'center', fontSize:'0.8rem'}}>Loading...</p>
            ) : messages.length === 0 ? (
              <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop:'3rem'}}>
                <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.85rem'}}>No messages yet</p>
                <p style={{color:'rgba(255,255,255,0.15)', fontSize:'0.75rem', marginTop:'0.25rem'}}>Say hi to {selectedUser.name}! 👋</p>
              </div>
            ) : messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const msgUser = isMe ? user : selectedUser;
              return (
                <div key={msg.id} style={{display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'0.4rem'}}>
                  {!isMe && <Avatar user={msgUser} size={26} radius="7px"/>}
                  <div style={{
                    maxWidth:'65%', padding:'0.55rem 0.875rem',
                    borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    fontSize:'0.85rem', lineHeight:'1.5',
                    background: isMe ? 'linear-gradient(135deg,#16a34a,#0f3d2e)' : 'rgba(255,255,255,0.07)',
                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: isMe ? 'white' : 'rgba(255,255,255,0.85)'
                  }}>
                    {msg.content}
                    <p style={{fontSize:'0.62rem', color: isMe ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', marginTop:'0.2rem', textAlign:'right'}}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  {isMe && <Avatar user={msgUser} size={26} radius="7px"/>}
                </div>
              );
            })}
            <div ref={bottomRef}/>
          </div>

          <div style={{padding:'0.75rem 1rem', borderTop:'1px solid rgba(34,197,94,0.12)', background:'rgba(0,0,0,0.1)'}}>
            <form onSubmit={sendMessage} style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
              <Avatar user={user} size={28} radius="8px"/>
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${selectedUser.name}...`} className="input-field" style={{fontSize:'0.85rem'}}/>
              <button type="submit" disabled={!newMessage.trim()} className="btn-primary" style={{padding:'0.5rem 1rem', flexShrink:0}}>
                <Send size={14}/>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );

  const pageHeight = 'calc(100vh - 130px)';

  return (
    <div className="page-bg">
      <Navbar user={user}/>
     <div style={{maxWidth:'2500px', margin:'0 auto', padding:'1.25rem 1rem 2rem', flex:1}}>

        {/* Desktop */}
        <div className="hidden-mobile" style={{display:'grid', gridTemplateColumns:'300px 1fr', gap:'0.75rem', height:'calc(100vh - 130px)'}}>
          <ContactList/>
          <ChatWindow/>
        </div>

        {/* Mobile */}
        <div className="show-mobile" style={{height:'calc(100vh - 130px)'}}>
          {!showChat ? <ContactList/> : <ChatWindow/>}
        </div>

      </div>
      <Footer/>
    </div>
  );
}