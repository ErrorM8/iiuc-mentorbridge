'use client';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Send, Bot } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Career Mentor 🎓\n\nAsk me anything about careers, internships, courses, or university life. I can also help with questions about your IIUC courses!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
    setInput('');
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat`,
        { message: currentInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }]);
    } finally { setLoading(false); }
  };

  const quickPrompts = [
    'How to get an internship as a CSE student?',
    'What skills should I learn for web development?',
    'How to write a good CV?',
    'Tips for job interviews?',
  ];

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem', display:'flex', flexDirection:'column'}}>

        {/* Header */}
        <div className="post-card" style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.65rem', flexShrink:0}}>
          <div style={{width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <Bot size={22} color="#22c55e"/>
          </div>
          <div>
            <p style={{fontWeight:700, color:'white', fontSize:'0.95rem'}}>AI Career Mentor</p>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>Powered by LLaMA 3.3 70B • Ask anything!</p>
          </div>
          <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:'0.35rem'}}>
            <div style={{width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e'}}/>
            <span style={{color:'#22c55e', fontSize:'0.72rem', fontWeight:600}}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="glass-card" style={{flex:1, padding:'1rem', overflowY:'auto', marginBottom:'0.65rem', minHeight:'400px', maxHeight:'calc(100vh - 300px)', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
          {messages.map((msg, i) => (
            <div key={i} style={{display:'flex', gap:'0.65rem', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-start'}}>
              {msg.role === 'assistant' && (
                <div style={{width:'32px', height:'32px', borderRadius:'9px', background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'2px'}}>
                  <Bot size={16} color="#22c55e"/>
                </div>
              )}
              <div style={{maxWidth:'78%'}}>
                <div style={{
                  padding:'0.65rem 0.875rem',
                  borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#16a34a,#0f3d2e)' : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  <p style={{color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.85)', fontSize:'0.875rem', lineHeight:'1.65', whiteSpace:'pre-wrap', wordBreak:'break-word'}}>
                    {msg.content}
                  </p>
                </div>
              </div>
              {msg.role === 'user' && <Avatar user={user} size={32} radius="9px"/>}
            </div>
          ))}

          {loading && (
            <div style={{display:'flex', gap:'0.65rem', alignItems:'flex-start'}}>
              <div style={{width:'32px', height:'32px', borderRadius:'9px', background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))', border:'1px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <Bot size={16} color="#22c55e"/>
              </div>
              <div style={{padding:'0.65rem 0.875rem', borderRadius:'14px 14px 14px 3px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', gap:'0.35rem', alignItems:'center'}}>
                {[0,1,2].map(i => (
                  <div key={i} style={{width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.65rem', flexShrink:0}}>
            {quickPrompts.map((prompt, i) => (
              <button key={i} onClick={() => { setInput(prompt); }}
                style={{background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'rgba(255,255,255,0.65)', borderRadius:'999px', padding:'0.35rem 0.875rem', fontSize:'0.75rem', cursor:'pointer', transition:'all 0.2s'}}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.15)'; e.currentTarget.style.color='#22c55e'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(34,197,94,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="post-card" style={{padding:'0.75rem', flexShrink:0}}>
          <form onSubmit={sendMessage} style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask anything — career, courses, internships..."
              className="input-field" style={{fontSize:'0.875rem'}} disabled={loading}/>
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary"
              style={{padding:'0.5rem 1rem', flexShrink:0, display:'flex', alignItems:'center', gap:'0.35rem'}}>
              {loading ? '...' : <Send size={14}/>}
            </button>
          </form>
        </div>
      </div>
      <Footer/>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}