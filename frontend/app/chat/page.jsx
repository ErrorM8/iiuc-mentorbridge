'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Send, Bot, Zap, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

const QUICK_PROMPTS = [
  '📚 Give me practical study tips for university students',
  '🚀 How can I prepare for my future career while studying?',
  '🎓 How can I make the most of my university life?',
  '⚖️ How can I balance studies, personal life, and extracurricular activities?',
  '🔥 How can I stay motivated when university life becomes difficult?',
  '📄 How can I build a strong CV?',
];

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, { message: msg, history }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || res.data.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  }, [input, loading, messages, token]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="page-bg">
      <Sidebar user={user}/>
      <div className="main-with-sidebar" style={{display:'flex',flexDirection:'column',height:'100vh'}}>
        <div style={{flex:1,display:'flex',flexDirection:'column',maxWidth:'760px',margin:'0 auto',width:'100%',padding:'0 1.5rem',minHeight:0}}>

          {/* Header */}
          <div style={{padding:'1.75rem 0 1.25rem',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.875rem'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))',border:'1px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Bot size={24} color="#22c55e"/>
              </div>
              <div>
                <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.4rem',color:'white',lineHeight:1.2}}>AI Career Mentor</h2>
                <p style={{color:'#22c55e',fontSize:'0.78rem',fontWeight:500}}>● Available 24/7 — Powered by Groq AI</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',paddingBottom:'1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
            {messages.length === 0 ? (
              <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'1.5rem',padding:'2rem 0'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{width:'72px',height:'72px',borderRadius:'20px',background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(15,61,46,0.25))',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',animation:'float 3s ease-in-out infinite'}}>
                    <Bot size={36} color="#22c55e"/>
                  </div>
                  <h3 style={{color:'white',fontWeight:700,fontSize:'1.1rem',marginBottom:'0.4rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>How can I help you today?</h3>
                  <p style={{color:'var(--text2)',fontSize:'0.85rem'}}>Ask me anything about career, academics, or technical topics</p>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'0.5rem',width:'100%'}}>
                  {QUICK_PROMPTS.map((prompt,i) => (
                    <button key={i} onClick={()=>sendMessage(prompt)} style={{
                      padding:'0.65rem 0.875rem',borderRadius:'10px',textAlign:'left',cursor:'pointer',fontSize:'0.8rem',
                      background:'rgba(255,255,255,0.04)',border:'1px solid rgba(34,197,94,0.15)',
                      color:'var(--text2)',transition:'all 0.2s',fontFamily:'inherit',lineHeight:'1.4'
                    }}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.35)';e.currentTarget.style.color='#22c55e';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.15)';e.currentTarget.style.color='var(--text2)';}}>
                      <Zap size={11} color="#22c55e" style={{marginRight:'0.4rem',verticalAlign:'middle'}}/>{prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} style={{display:'flex',gap:'0.65rem',alignItems:'flex-start',justifyContent: msg.role==='user'?'flex-end':'flex-start',animation:'fadeIn 0.3s ease'}}>
                    {msg.role === 'assistant' && (
                      <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px'}}>
                        <Bot size={16} color="#22c55e"/>
                      </div>
                    )}
                    <div style={{
                      maxWidth:'75%',
                      borderRadius: msg.role==='user'?'14px 14px 3px 14px':'14px 14px 14px 3px',
                      padding:'0.75rem 1rem',
                      background: msg.role==='user'?'linear-gradient(135deg,#16a34a,#0f3d2e)':'rgba(255,255,255,0.05)',
                      border: msg.role==='user'?'none':'1px solid rgba(34,197,94,0.12)',
                    }}>
                      <p style={{color:'white',fontSize:'0.875rem',lineHeight:'1.65',whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{msg.content}</p>
                    </div>
                    {msg.role === 'user' && <Avatar user={user} size={32} radius="9px"/>}
                  </div>
                ))}
                {loading && (
                  <div style={{display:'flex',gap:'0.65rem',alignItems:'flex-start',animation:'fadeIn 0.3s ease'}}>
                    <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Bot size={16} color="#22c55e"/>
                    </div>
                    <div style={{borderRadius:'14px 14px 14px 3px',padding:'0.875rem 1rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(34,197,94,0.12)',display:'flex',gap:'0.35rem',alignItems:'center'}}>
                      {[0,1,2].map(i => <div key={i} style={{width:'7px',height:'7px',borderRadius:'50%',background:'#22c55e',animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </>
            )}
          </div>

          {/* Input */}
          <div style={{padding:'1rem 0',flexShrink:0,borderTop:'1px solid rgba(34,197,94,0.1)'}}>
            {messages.length > 0 && (
              <button onClick={()=>setMessages([])} style={{display:'flex',alignItems:'center',gap:'0.35rem',background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:'0.75rem',marginBottom:'0.65rem',padding:'0.25rem 0.5rem',borderRadius:'6px',transition:'all 0.2s'}}
                onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                <X size={13}/> Clear conversation
              </button>
            )}
            <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-end'}}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Ask about careers, academics, or technical topics..."
                className="input-field" style={{resize:'none',fontSize:'0.875rem',flex:1,minHeight:'52px',maxHeight:'120px',lineHeight:'1.5'}}
                rows={1}/>
              <button onClick={()=>sendMessage()} disabled={!input.trim()||loading} className="btn-primary"
                style={{padding:'0.65rem 1.1rem',flexShrink:0,height:'52px'}}>
                <Send size={16}/>
              </button>
            </div>
            <p style={{color:'var(--text3)',fontSize:'0.68rem',marginTop:'0.4rem',textAlign:'center'}}>Press Enter to send • Shift+Enter for new line</p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes bounce{0%,80%,100%{transform:scale(0.5);opacity:0.4}40%{transform:scale(1);opacity:1}}
      `}</style>
    </div>
  );
}