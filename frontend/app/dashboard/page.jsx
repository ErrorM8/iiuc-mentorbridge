'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ThumbsUp, MessageCircle, Share2, MoreVertical, Edit2, Trash2,
  Send, X, CornerDownRight, ImageIcon, ChevronLeft, ChevronRight,
  Check, Bot, Users, Zap, ExternalLink, RefreshCw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';

const EMOJIS = [
  { emoji:'👍', label:'Like' }, { emoji:'❤️', label:'Love' },
  { emoji:'😂', label:'Haha' }, { emoji:'😮', label:'Wow' },
  { emoji:'😢', label:'Sad' }, { emoji:'🔥', label:'Fire' },
];

// ── Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  useEffect(() => {
    const fn = (e) => {
      if (e.key==='Escape') onClose();
      if (e.key==='ArrowRight') setCurrent(p=>(p+1)%images.length);
      if (e.key==='ArrowLeft') setCurrent(p=>(p-1+images.length)%images.length);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [images.length, onClose]);
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.96)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <button onClick={onClose} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.1)',border:'none',color:'white',borderRadius:'50%',width:'40px',height:'40px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <X size={18}/>
      </button>
      <img src={images[current].url} alt="" onClick={e=>e.stopPropagation()} style={{maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:'10px'}}/>
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p-1+images.length)%images.length);}} style={{position:'absolute',left:'1rem',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'44px',height:'44px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronLeft size={22}/>
          </button>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p+1)%images.length);}} style={{position:'absolute',right:'1rem',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'44px',height:'44px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronRight size={22}/>
          </button>
          <div style={{position:'absolute',bottom:'1.5rem',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'0.4rem'}}>
            {images.map((_,i)=>(
              <button key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}} style={{width:i===current?'22px':'7px',height:'7px',borderRadius:'999px',background:i===current?'#22c55e':'rgba(255,255,255,0.4)',border:'none',cursor:'pointer',padding:0,transition:'all 0.25s'}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Image Carousel ────────────────────────────────────────────────────
function ImageCarousel({ images, onImageClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div style={{position:'relative',borderRadius:'10px',overflow:'hidden',background:'#0a100a',marginBottom:'0.6rem'}}>
      <img src={images[current].url} alt="" style={{width:'100%',maxHeight:'420px',objectFit:'contain',display:'block',cursor:'zoom-in'}} onClick={()=>onImageClick(current)}/>
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p-1+images.length)%images.length);}} style={{position:'absolute',left:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.65)',border:'none',color:'white',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronLeft size={15}/>
          </button>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p+1)%images.length);}} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.65)',border:'none',color:'white',borderRadius:'50%',width:'32px',height:'32px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <ChevronRight size={15}/>
          </button>
          <div style={{position:'absolute',bottom:'0.5rem',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'0.3rem'}}>
            {images.map((_,i)=>(
              <button key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}} style={{width:i===current?'18px':'6px',height:'6px',borderRadius:'999px',background:i===current?'#22c55e':'rgba(255,255,255,0.45)',border:'none',cursor:'pointer',padding:0,transition:'all 0.2s'}}/>
            ))}
          </div>
          <div style={{position:'absolute',top:'0.5rem',right:'0.5rem',background:'rgba(0,0,0,0.6)',borderRadius:'999px',padding:'2px 8px',fontSize:'0.68rem',color:'white'}}>
            {current+1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

// ── Likes Modal ───────────────────────────────────────────────────────
function LikesModal({ postId, token, count, onClose }) {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/likes`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setLikers(res.data)).catch(() => setLikers([]))
      .finally(() => setLoading(false));
  }, [postId, token]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" style={{width:'100%',maxWidth:'340px',padding:'1.25rem',maxHeight:'65vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem',flexShrink:0}}>
          <h3 style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>👍 {count} {count===1?'Like':'Likes'}</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.4rem'}}>
          {loading ? <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'1rem'}}>Loading...</p>
          : likers.length===0 ? <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'1rem'}}>No likes yet</p>
          : likers.map((liker,i) => (
            <Link key={i} href={`/users/${liker.userId||liker.user?.id}`} style={{textDecoration:'none'}} onClick={onClose}>
              <div style={{display:'flex',alignItems:'center',gap:'0.65rem',padding:'0.5rem 0.65rem',borderRadius:'10px',cursor:'pointer',transition:'background 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.08)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <Avatar user={liker.user||liker} size={34} radius="9px"/>
                <div>
                  <p style={{color:'white',fontWeight:600,fontSize:'0.84rem'}}>{liker.user?.name||liker.name}</p>
                  <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.72rem'}}>{liker.user?.department||liker.department}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Comments Modal ────────────────────────────────────────────────────
function CommentsModal({ postId, token, count, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setComments(res.data)).catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId, token]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" style={{width:'100%',maxWidth:'420px',padding:'1.25rem',maxHeight:'70vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem',flexShrink:0}}>
          <h3 style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>💬 {count} Comments</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
          {loading ? <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'1rem'}}>Loading...</p>
          : comments.length===0 ? <p style={{color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'1rem'}}>No comments yet</p>
          : comments.map((c,i) => (
            <div key={c.id||i} style={{display:'flex',gap:'0.5rem'}}>
              <Avatar user={c.user} size={28} radius="8px"/>
              <div style={{flex:1}}>
                <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'0.45rem 0.75rem'}}>
                  <p style={{color:'#22c55e',fontSize:'0.75rem',fontWeight:700,marginBottom:'0.1rem'}}>{c.user?.name}</p>
                  <p style={{color:'rgba(255,255,255,0.8)',fontSize:'0.82rem',lineHeight:'1.45'}}>{c.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────────────────
function ShareModal({ post, onClose }) {
  const [copied, setCopied] = useState(false);
  const text = `Check this post on IIUC MentorBridge!\n"${post.content?.slice(0,100)}"\n— ${post.user?.name}`;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" style={{width:'100%',maxWidth:'340px',padding:'1.25rem'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h3 style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>Share Post</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          <button onClick={()=>{navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',borderRadius:'10px',background:copied?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.05)',border:`1px solid ${copied?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.1)'}`,cursor:'pointer',width:'100%',color:'white',transition:'all 0.2s'}}>
            <div style={{width:'34px',height:'34px',borderRadius:'8px',background:'rgba(34,197,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {copied ? <Check size={16} color="#22c55e"/> : <Share2 size={16} color="#22c55e"/>}
            </div>
            <span style={{fontSize:'0.85rem',fontWeight:500}}>{copied ? '✓ Copied!' : 'Copy Link'}</span>
          </button>
          <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank')}
            style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',borderRadius:'10px',background:'rgba(37,211,102,0.08)',border:'1px solid rgba(37,211,102,0.2)',cursor:'pointer',width:'100%',color:'white'}}>
            <div style={{width:'34px',height:'34px',borderRadius:'8px',background:'rgba(37,211,102,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'1rem'}}>💬</div>
            <span style={{fontSize:'0.85rem',fontWeight:500}}>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Comment Item ──────────────────────────────────────────────────────
function CommentItem({ comment, currentUser, postId, token, depth=0 }) {
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions||[]);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies||[]);
  const reactRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (reactRef.current && !reactRef.current.contains(e.target)) setShowReactions(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const myReaction = reactions.find(r => r.userId === currentUser?.id);

  const handleReact = async (emoji) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments/${comment.id}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.removed) setReactions(prev => prev.filter(r => r.userId !== currentUser?.id));
      else setReactions(prev => [...prev.filter(r => r.userId !== currentUser?.id), { userId: currentUser?.id, emoji }]);
    } catch {}
    setShowReactions(false);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
        { content: replyText, parentId: comment.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplies(prev => [...prev, res.data]);
      setReplyText('');
      setReplying(false);
    } catch {}
  };

  const reactionCounts = reactions.reduce((acc, r) => { acc[r.emoji]=(acc[r.emoji]||0)+1; return acc; }, {});

  return (
    <div style={{marginLeft: depth>0?'1.75rem':0}}>
      <div style={{display:'flex',gap:'0.5rem',alignItems:'flex-start'}}>
        <Link href={`/users/${comment.user?.id}`}><Avatar user={comment.user} size={27} radius="7px"/></Link>
        <div style={{flex:1}}>
          <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'10px',padding:'0.4rem 0.7rem',border:'1px solid rgba(255,255,255,0.05)'}}>
            <Link href={`/users/${comment.user?.id}`} style={{color:'#22c55e',fontSize:'0.72rem',fontWeight:700,textDecoration:'none',display:'block',marginBottom:'0.1rem'}}>{comment.user?.name}</Link>
            <p style={{color:'rgba(255,255,255,0.8)',fontSize:'0.82rem',lineHeight:'1.45'}}>{comment.content}</p>
          </div>
          {Object.keys(reactionCounts).length > 0 && (
            <div style={{display:'flex',gap:'0.2rem',marginTop:'0.2rem',flexWrap:'wrap'}}>
              {Object.entries(reactionCounts).map(([emoji,count]) => (
                <span key={emoji} onClick={()=>handleReact(emoji)} style={{background:'rgba(255,255,255,0.07)',borderRadius:'999px',padding:'1px 6px',fontSize:'0.72rem',cursor:'pointer',border:myReaction?.emoji===emoji?'1px solid rgba(34,197,94,0.5)':'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:'0.2rem'}}>
                  {emoji} <span style={{color:'rgba(255,255,255,0.5)'}}>{count}</span>
                </span>
              ))}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:'0.35rem',marginTop:'0.2rem'}}>
            <div ref={reactRef} style={{position:'relative'}}>
              <button onClick={()=>setShowReactions(!showReactions)} style={{background:'transparent',border:'none',color:myReaction?'#22c55e':'rgba(255,255,255,0.3)',fontSize:'0.7rem',cursor:'pointer',padding:'0.1rem 0.35rem',borderRadius:'5px'}}>
                {myReaction?myReaction.emoji:'👍'} React
              </button>
              {showReactions && (
                <div style={{position:'absolute',bottom:'calc(100% + 4px)',left:0,background:'rgba(15,20,15,0.97)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'12px',padding:'0.4rem',display:'flex',gap:'0.25rem',zIndex:30,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
                  {EMOJIS.map(({emoji,label}) => (
                    <button key={emoji} onClick={()=>handleReact(emoji)} title={label} style={{background:myReaction?.emoji===emoji?'rgba(34,197,94,0.2)':'transparent',border:'none',cursor:'pointer',fontSize:'1.1rem',padding:'0.2rem 0.25rem',borderRadius:'7px',lineHeight:1,transition:'transform 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.3)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {depth === 0 && (
              <button onClick={()=>setReplying(!replying)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',fontSize:'0.7rem',cursor:'pointer',padding:'0.1rem 0.35rem',borderRadius:'5px'}}>
                <CornerDownRight size={10}/> Reply
              </button>
            )}
            <span style={{color:'rgba(255,255,255,0.18)',fontSize:'0.65rem'}}>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          {replying && (
            <form onSubmit={handleReply} style={{display:'flex',gap:'0.35rem',marginTop:'0.4rem'}}>
              <input type="text" value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder={`Reply...`} className="input-field" style={{fontSize:'0.78rem',padding:'0.32rem 0.65rem'}} autoFocus/>
              <button type="submit" className="btn-primary" style={{padding:'0.32rem 0.65rem',flexShrink:0}}><Send size={12}/></button>
              <button type="button" onClick={()=>setReplying(false)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer'}}><X size={14}/></button>
            </form>
          )}
          {replies.length > 0 && (
            <div style={{marginTop:'0.45rem',display:'flex',flexDirection:'column',gap:'0.35rem'}}>
              {replies.map(reply => <CommentItem key={reply.id} comment={reply} currentUser={currentUser} postId={postId} token={token} depth={depth+1}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── IIUC News Card ────────────────────────────────────────────────────
function IIUCNewsCard({ token }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/news/iiuc`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setNews(
        Array.isArray(res.data?.news)
          ? res.data.news
          : []
      ); 
    setLastUpdated(new Date());
    } catch {
      setNews([{
        title: 'Visit IIUC Official Website for Latest News',
        url: 'https://www.iiuc.ac.bd/web/news',
        date: new Date().toISOString(),
        source: 'IIUC Official'
      }]);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchNews();
    // Auto refresh every 10 minutes
    const interval = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  return (
    <div className="glass-card" style={{padding:'1.25rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}}>
        <p style={{color:'white',fontWeight:700,fontSize:'0.875rem',fontFamily:"'Plus Jakarta Sans',sans-serif",display:'flex',alignItems:'center',gap:'0.4rem'}}>
          📰 IIUC News
        </p>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <button onClick={fetchNews} disabled={loading}
            title="Refresh news"
            style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.35)',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',padding:'0.2rem',borderRadius:'6px',transition:'color 0.2s'}}
            onMouseEnter={e=>!loading&&(e.currentTarget.style.color='#22c55e')}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
            <RefreshCw size={13} style={{animation:loading?'spin 1s linear infinite':'none'}}/>
          </button>
          <a href="https://www.iiuc.ac.bd/web/news" target="_blank" rel="noreferrer"
            style={{color:'#22c55e',fontSize:'0.72rem',textDecoration:'none',fontWeight:600}}>
            View all →
          </a>
        </div>
      </div>

      {lastUpdated && (
        <p style={{color:'var(--text3)',fontSize:'0.65rem',marginBottom:'0.6rem'}}>
          Updated: {lastUpdated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
        </p>
      )}

      {loading ? (
        <div style={{display:'flex',justifyContent:'center',padding:'1rem'}}>
          <div style={{width:'20px',height:'20px',border:'2px solid rgba(34,197,94,0.2)',borderTop:'2px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        </div>
      ) : news.length === 0 ? (
        <a href="https://www.iiuc.ac.bd/web/news" target="_blank" rel="noreferrer"
          style={{display:'block',textAlign:'center',color:'#22c55e',fontSize:'0.82rem',textDecoration:'none',padding:'0.5rem'}}>
          Visit IIUC Website →
        </a>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
          {news.slice(0, 3).map((item, i) => (
            <a key={i} href={item.url||'https://www.iiuc.ac.bd/web/news'} target="_blank" rel="noreferrer"
              style={{textDecoration:'none',padding:'0.6rem 0.65rem',borderRadius:'9px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(34,197,94,0.1)',transition:'all 0.2s',display:'block'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.07)';e.currentTarget.style.borderColor='rgba(34,197,94,0.25)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(34,197,94,0.1)';}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.4rem'}}>
                <p style={{color:'rgba(255,255,255,0.85)',fontSize:'0.78rem',lineHeight:'1.45',fontWeight:500,flex:1}}>
                  {item.title}
                </p>
                <ExternalLink size={11} color="rgba(34,197,94,0.5)" style={{flexShrink:0,marginTop:'2px'}}/>
              </div>
              {item.date && (
                <p style={{color:'var(--text3)',fontSize:'0.65rem',marginTop:'0.2rem'}}>
                  {new Date(item.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                  {item.source ? ` • ${item.source}` : ''}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Online Now Card ───────────────────────────────────────────────────
function OnlineNowCard({ token, user }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token || !user) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const connected = res.data.map(conn =>
        conn.senderId === user.id ? conn.receiver : conn.sender
      );
      setOnlineUsers(connected.slice(0, 8));
    }).catch(() => {});
  }, [token, user]);

  return (
    <div className="glass-card" style={{padding:'1.25rem'}}>
      <p style={{color:'white',fontWeight:700,fontSize:'0.875rem',fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
        <span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#22c55e',display:'inline-block'}}/>
        Online Now
      </p>
      {onlineUsers.length === 0 ? (
        <div style={{textAlign:'center',padding:'0.5rem 0'}}>
          <p style={{color:'var(--text3)',fontSize:'0.8rem'}}>Connect with members to see them here</p>
          <Link href="/users" className="btn-outline" style={{display:'inline-flex',marginTop:'0.5rem',padding:'0.35rem 0.875rem',fontSize:'0.78rem',textDecoration:'none'}}>
            Find Members
          </Link>
        </div>
      ) : (
        <>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'0.5rem'}}>
            {onlineUsers.slice(0,6).map(u => (
              <Link key={u.id} href={`/users/${u.id}`} title={u.name} style={{position:'relative',textDecoration:'none'}}>
                <Avatar user={u} size={34} radius="50%"/>
                <span style={{position:'absolute',bottom:'-1px',right:'-1px',width:'9px',height:'9px',borderRadius:'50%',background:'#22c55e',border:'2px solid #0f150d'}}/>
              </Link>
            ))}
            {onlineUsers.length > 6 && (
              <Link href="/users" style={{width:'34px',height:'34px',borderRadius:'50%',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',color:'#22c55e',fontSize:'0.7rem',fontWeight:700,textDecoration:'none'}}>
                +{onlineUsers.length-6}
              </Link>
            )}
          </div>
          <p style={{color:'var(--text3)',fontSize:'0.75rem'}}>{onlineUsers.length} connected members</p>
        </>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [token, setToken] = useState('');
  const [sharePost, setSharePost] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [likesModal, setLikesModal] = useState(null);
  const [commentsModal, setCommentsModal] = useState(null);

  const tokenRef = useRef('');

  const fetchPosts = useCallback(async (tkn) => {
    if (!tkn) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });

      // Handle both {posts: [...]} and [...] response formats
      const postsData = Array.isArray(res.data) ? res.data : (res.data.posts || []);

      if (!Array.isArray(postsData)) {
        console.error('Posts is not array:', postsData);
        setPosts([]);
        return;
      }

      setPosts(postsData);

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const liked = {};
      const counts = {};
      postsData.forEach(p => {
        counts[p.id] = p._count?.likes || 0;
        liked[p.id] = Array.isArray(p.likes) ? p.likes.some(l => l.userId === currentUser.id) : false;
      });
      setLikeCounts(counts);
      setLikedPosts(liked);
    } catch (err) {
      console.error('Fetch posts error:', err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    tokenRef.current = tkn;
    setToken(tkn);
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    fetchPosts(tkn);
  }, [router, fetchPosts]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { alert('Max 5 images'); return; }
    setPostImages(files);
    setImagePreview(files.map(f => URL.createObjectURL(f)));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && postImages.length === 0) return;
    setPosting(true);
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('type', 'general');
    postImages.forEach(img => formData.append('images', img));
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const newPostData = res.data.post || res.data;
      setPosts(prev => [newPostData, ...prev]);
      setLikeCounts(prev => ({ ...prev, [newPostData.id]: 0 }));
      setLikedPosts(prev => ({ ...prev, [newPostData.id]: false }));
      setNewPost('');
      setPostImages([]);
      setImagePreview([]);
    } catch (err) { console.error('Post error:', err.message); }
    finally { setPosting(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev => prev.map(p => p.id===postId ? { ...p, content: res.data.post?.content || editContent } : p));
      setEditingPost(null);
      setEditContent('');
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikedPosts(prev => ({ ...prev, [postId]: res.data.liked }));
      setLikeCounts(prev => ({ ...prev, [postId]: res.data.count }));
    } catch (err) { console.error(err); }
  };

  const openComments = async (postId) => {
    if (commentOpen === postId) { setCommentOpen(null); return; }
    setCommentOpen(postId);
    if (comments[postId]) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`,
        { content: newComment[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId]||[]), { ...res.data, replies:[] }] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id===postId ? { ...p, _count: { ...p._count, comments:(p._count?.comments||0)+1 } } : p));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
        <div style={{width:'44px',height:'44px',border:'3px solid rgba(34,197,94,0.2)',borderTop:'3px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
        <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.85rem'}}>Loading feed...</p>
      </div>
    </div>
  );

  return (
    <div className="page-bg" onClick={()=>activeMenu&&setActiveMenu(null)}>
      <Sidebar user={user}/>
      <div className="main-with-sidebar">
        <div style={{maxWidth:'1280px',margin:'0 auto',width:'100%',padding:'2rem 1.5rem 3rem',display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.5rem',alignItems:'start'}} className="dashboard-grid">

          {/* ── Left Feed ── */}
          <div style={{minWidth:0}}>

            {/* Welcome */}
            <div style={{marginBottom:'1.25rem'}}>
              <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.75rem',color:'white',lineHeight:1.2,marginBottom:'0.35rem'}}>
                Welcome back, <span style={{color:'#22c55e'}}>{user?.name?.split(' ')[0]}</span>.
              </h1>
              <p style={{color:'var(--text2)',fontSize:'0.875rem'}}>Here's what's happening in your IIUC community today.</p>
            </div>

            {/* Create Post */}
            <div className="glass-card pulse-hover" style={{padding:'1.125rem',marginBottom:'1.25rem'}}>
              <form onSubmit={handlePost}>
                <div style={{display:'flex',gap:'0.75rem',marginBottom:'0.75rem'}}>
                  <Avatar user={user} size={38} radius="9px"/>
                  <textarea value={newPost} onChange={e=>setNewPost(e.target.value)}
                    placeholder="Share a project update or ask a question..."
                    className="input-field" style={{resize:'none',fontSize:'0.875rem',flex:1,minHeight:'72px'}} rows={2}/>
                </div>
                {imagePreview.length > 0 && (
                  <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'0.6rem',paddingLeft:'3rem'}}>
                    {imagePreview.map((src,i) => (
                      <div key={i} style={{position:'relative'}}>
                        <img src={src} alt="" style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'8px',border:'1px solid rgba(34,197,94,0.25)'}}/>
                        <button type="button" onClick={()=>{
                          setPostImages(prev=>prev.filter((_,idx)=>idx!==i));
                          setImagePreview(prev=>prev.filter((_,idx)=>idx!==i));
                        }} style={{position:'absolute',top:'-5px',right:'-5px',background:'#ef4444',border:'none',color:'white',borderRadius:'50%',width:'17px',height:'17px',cursor:'pointer',fontSize:'0.65rem',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingLeft:'3rem',borderTop:'1px solid rgba(34,197,94,0.1)',paddingTop:'0.65rem'}}>
                  <label style={{cursor:'pointer',display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.3rem 0.6rem',borderRadius:'7px',transition:'background 0.2s',color:'var(--text2)',fontSize:'0.82rem'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <ImageIcon size={15} color="#22c55e"/> Photo
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} style={{display:'none'}}/>
                  </label>
                  <button type="submit" disabled={posting||(!newPost.trim()&&postImages.length===0)} className="btn-primary" style={{padding:'0.4rem 1.25rem',fontSize:'0.85rem'}}>
                    {posting ? '...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div style={{textAlign:'center',padding:'3rem',animation:'fadeIn 0.5s ease'}}>
                <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🌱</div>
                <p style={{color:'var(--text2)',fontSize:'0.875rem'}}>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              <div className="stagger-children" style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                {posts.map((post, idx) => (
                  <div key={post.id} className="glass-card pulse-hover" style={{padding:'1.125rem',animationDelay:`${idx*0.04}s`}} onClick={e=>e.stopPropagation()}>

                    {/* Post Header */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.65rem',marginBottom:'0.75rem'}}>
                      <Link href={`/users/${post.user?.id}`} style={{flexShrink:0}}>
                        <Avatar user={post.user} size={40} radius="10px"/>
                      </Link>
                      <div style={{flex:1,minWidth:0}}>
                        <Link href={`/users/${post.user?.id}`} style={{fontWeight:700,color:'white',fontSize:'0.9rem',textDecoration:'none',display:'block',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                          {post.user?.name}
                        </Link>
                        <p style={{color:'var(--text3)',fontSize:'0.72rem'}}>
                          {post.user?.role} • {post.user?.department} • {new Date(post.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        </p>
                      </div>
                      {post.userId === user?.id && (
                        <div style={{position:'relative',flexShrink:0}}>
                          <button onClick={e=>{e.stopPropagation();setActiveMenu(activeMenu===post.id?null:post.id);}} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',padding:'0.3rem',borderRadius:'7px',display:'flex',alignItems:'center',transition:'all 0.2s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            <MoreVertical size={16}/>
                          </button>
                          {activeMenu === post.id && (
                            <div className="dropdown-menu" style={{position:'absolute',right:0,top:'2rem',zIndex:20}}>
                              <button className="dropdown-item" onClick={()=>{setEditingPost(post.id);setEditContent(post.content);setActiveMenu(null);}}>
                                <Edit2 size={13}/> Edit
                              </button>
                              <button className="dropdown-item dropdown-item-danger" onClick={()=>handleDeletePost(post.id)}>
                                <Trash2 size={13}/> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    {editingPost === post.id ? (
                      <div style={{marginBottom:'0.6rem'}}>
                        <textarea value={editContent} onChange={e=>setEditContent(e.target.value)} className="input-field" style={{resize:'none',fontSize:'0.875rem',marginBottom:'0.4rem'}} rows={3} autoFocus/>
                        <div style={{display:'flex',gap:'0.4rem'}}>
                          <button onClick={()=>handleEditPost(post.id)} className="btn-primary" style={{padding:'0.35rem 0.875rem',fontSize:'0.8rem'}}><Send size={12}/> Save</button>
                          <button onClick={()=>{setEditingPost(null);setEditContent('');}} className="btn-outline" style={{padding:'0.35rem 0.875rem',fontSize:'0.8rem'}}><X size={12}/> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.content && (
                          <p style={{color:'var(--text)',fontSize:'0.9rem',lineHeight:'1.65',marginBottom:post.images?.length>0?'0.6rem':'0.75rem',whiteSpace:'pre-wrap'}}>
                            {post.content}
                          </p>
                        )}
                        {post.images && post.images.length > 0 && (
                          <ImageCarousel images={post.images} onImageClick={(i)=>setLightbox({images:post.images,index:i})}/>
                        )}
                      </>
                    )}

                    {/* Like/Comment Counts */}
                    {(likeCounts[post.id] > 0 || post._count?.comments > 0) && (
                      <div style={{display:'flex',gap:'1rem',marginBottom:'0.4rem',paddingBottom:'0.4rem',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                        {likeCounts[post.id] > 0 && (
                          <button onClick={()=>setLikesModal({postId:post.id,count:likeCounts[post.id]})} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'0.73rem',display:'flex',alignItems:'center',gap:'0.3rem',padding:'0.1rem 0',transition:'color 0.15s'}}
                            onMouseEnter={e=>e.currentTarget.style.color='#22c55e'}
                            onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                            <ThumbsUp size={12} color="#22c55e"/> {likeCounts[post.id]} likes
                          </button>
                        )}
                        {post._count?.comments > 0 && (
                          <button onClick={()=>setCommentsModal({postId:post.id,count:post._count.comments})} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'0.73rem',display:'flex',alignItems:'center',gap:'0.3rem',padding:'0.1rem 0',transition:'color 0.15s'}}
                            onMouseEnter={e=>e.currentTarget.style.color='#60a5fa'}
                            onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                            <MessageCircle size={12} color="#60a5fa"/> {post._count.comments} comments
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{display:'flex',alignItems:'center',gap:'0.15rem',marginBottom:commentOpen===post.id?'0.65rem':0}}>
                      <button className={`btn-ghost ${likedPosts[post.id]?'active':''}`} onClick={()=>handleLike(post.id)}
                        style={{color:likedPosts[post.id]?'#22c55e':undefined,fontSize:'0.8rem',fontWeight:likedPosts[post.id]?600:400}}>
                        <ThumbsUp size={14}/> Like
                      </button>
                      <button className="btn-ghost" onClick={()=>openComments(post.id)}
                        style={{color:commentOpen===post.id?'#60a5fa':undefined,fontSize:'0.8rem'}}>
                        <MessageCircle size={14}/> Comment
                      </button>
                      <button className="btn-ghost" onClick={()=>setSharePost(post)} style={{fontSize:'0.8rem'}}>
                        <Share2 size={14}/> Share
                      </button>
                    </div>

                    {/* Comments Section */}
                    {commentOpen === post.id && (
                      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'0.65rem'}}>
                        <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'0.65rem',maxHeight:'260px',overflowY:'auto'}}>
                          {!comments[post.id] ? (
                            <p style={{color:'var(--text3)',fontSize:'0.8rem',textAlign:'center',padding:'0.5rem'}}>Loading...</p>
                          ) : comments[post.id].length === 0 ? (
                            <p style={{color:'var(--text3)',fontSize:'0.8rem',textAlign:'center',padding:'0.5rem'}}>No comments yet. Be the first!</p>
                          ) : comments[post.id].map(comment => (
                            <CommentItem key={comment.id} comment={comment} currentUser={user} postId={post.id} token={token} depth={0}/>
                          ))}
                        </div>
                        <form onSubmit={e=>handleComment(e,post.id)} style={{display:'flex',gap:'0.45rem',alignItems:'center'}}>
                          <Avatar user={user} size={28} radius="8px"/>
                          <input type="text" value={newComment[post.id]||''} onChange={e=>setNewComment(prev=>({...prev,[post.id]:e.target.value}))}
                            placeholder="Write a comment..." className="input-field" style={{fontSize:'0.82rem',padding:'0.38rem 0.8rem'}}/>
                          <button type="submit" disabled={!newComment[post.id]?.trim()} className="btn-primary" style={{padding:'0.38rem 0.65rem',flexShrink:0}}>
                            <Send size={13}/>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
                <p style={{textAlign:'center',color:'rgba(255,255,255,0.12)',fontSize:'0.72rem',padding:'1rem 0'}}>— You're all caught up —</p>
              </div>
            )}
          </div>

          {/* ── Right Panel ── */}
          <div className="hidden-mobile" style={{display:'flex',flexDirection:'column',gap:'1rem',position:'sticky',top:'1.5rem'}}>

            {/* AI Card */}
            <div className="glass-card" style={{padding:'1.25rem',background:'linear-gradient(135deg,rgba(22,163,74,0.12),rgba(15,61,46,0.2))'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.65rem',marginBottom:'0.75rem'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Bot size={20} color="#22c55e"/>
                </div>
                <div>
                  <p style={{color:'white',fontWeight:700,fontSize:'0.875rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>AI Assistant</p>
                  <p style={{color:'#22c55e',fontSize:'0.7rem',fontWeight:500}}>● Available 24/7</p>
                </div>
              </div>
              <p style={{color:'var(--text2)',fontSize:'0.8rem',lineHeight:'1.55',marginBottom:'0.875rem'}}>
                Need quick help with debugging or concept explanations? Ask the AI mentor.
              </p>
              <Link href="/chat" className="btn-primary" style={{width:'100%',justifyContent:'center',fontSize:'0.82rem',padding:'0.55rem',display:'flex',alignItems:'center',gap:'0.4rem',textDecoration:'none'}}>
                <Zap size={14}/> Start Chat →
              </Link>
            </div>

            {/* IIUC News */}
            <IIUCNewsCard token={token}/>

            {/* Online Now */}
            <OnlineNowCard token={token} user={user}/>
          </div>
        </div>

        <style>{`
          @media(max-width:860px){.dashboard-grid{grid-template-columns:1fr!important}}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}</style>
      </div>

      {/* Modals */}
      {sharePost && <ShareModal post={sharePost} onClose={()=>setSharePost(null)}/>}
      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={()=>setLightbox(null)}/>}
      {likesModal && <LikesModal postId={likesModal.postId} token={token} count={likesModal.count} onClose={()=>setLikesModal(null)}/>}
      {commentsModal && <CommentsModal postId={commentsModal.postId} token={token} count={commentsModal.count} onClose={()=>setCommentsModal(null)}/>}
    </div>
  );
}