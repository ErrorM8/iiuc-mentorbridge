'use client';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Career Mentor. Ask me anything about internships, jobs, or career guidance!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, { message: input }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>
        <div className="glass-card fade-in" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'0.875rem 1.1rem', borderBottom:'1px solid rgba(34,197,94,0.15)', background:'rgba(34,197,94,0.05)', display:'flex', alignItems:'center', gap:'0.65rem'}}>
            <div style={{width:'32px', height:'32px', borderRadius:'8px', background:'linear-gradient(135deg,#16a34a,#0f3d2e)', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Bot size={16} color="white"/>
            </div>
            <div>
              <h2 style={{fontWeight:700, color:'#22c55e', fontSize:'0.9rem'}}>AI Career Mentor</h2>
              <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.7rem'}}>Powered by Groq AI • Always ready to help</p>
            </div>
          </div>

          <div style={{height:'420px', overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.65rem', background:'rgba(0,0,0,0.12)'}}>
            {messages.map((msg, index) => (
              <div key={index} style={{display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'0.4rem'}}>
                {msg.role === 'assistant' && (
                  <div style={{width:'26px', height:'26px', borderRadius:'6px', background:'linear-gradient(135deg,#16a34a,#0f3d2e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                    <Bot size={12} color="white"/>
                  </div>
                )}
                <div style={{
                  maxWidth:'72%',
                  padding:'0.55rem 0.875rem',
                  borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  fontSize:'0.845rem',
                  lineHeight:'1.55',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#16a34a,#0f3d2e)' : 'rgba(255,255,255,0.07)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.85)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-end', gap:'0.4rem'}}>
                <div style={{width:'26px', height:'26px', borderRadius:'6px', background:'linear-gradient(135deg,#16a34a,#0f3d2e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <Bot size={12} color="white"/>
                </div>
                <div style={{padding:'0.55rem 0.875rem', borderRadius:'12px 12px 12px 3px', fontSize:'0.82rem', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.35)'}}>
                  Thinking... 💭
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div style={{padding:'0.75rem 1rem', borderTop:'1px solid rgba(34,197,94,0.12)', background:'rgba(0,0,0,0.15)'}}>
            <form onSubmit={sendMessage} style={{display:'flex', gap:'0.5rem'}}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about internships, jobs, skills..." className="input-field" style={{fontSize:'0.845rem'}}/>
              <button type="submit" disabled={loading} className="btn-primary" style={{padding:'0.5rem 1rem', flexShrink:0}}>
                <Send size={14}/>
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}