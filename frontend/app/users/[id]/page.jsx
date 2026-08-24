'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus, UserCheck, UserX, MessageSquare, Droplets,
  BookOpen, MapPin, ThumbsUp, MessageCircle, ChevronLeft,
  ChevronRight, X, Send, MoreVertical, Trash2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import Avatar from '../../components/Avatar';

function ImageCarousel({ images, onImageClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div style={{position:'relative',borderRadius:'10px',overflow:'hidden',background:'rgba(0,0,0,0.3)',marginBottom:'0.5rem'}}>
      <img src={images[current].url} alt="" style={{width:'100%',maxHeight:'320px',objectFit:'contain',display:'block',cursor:'zoom-in'}} onClick={()=>onImageClick?.(current)}/>
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p-1+images.length)%images.length);}} style={{position:'absolute',left:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronLeft size={14}/></button>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p+1)%images.length);}} style={{position:'absolute',right:'0.5rem',top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronRight size={14}/></button>
          <div style={{position:'absolute',bottom:'0.4rem',left:'50%',transform:'translateX(-50%)',display:'flex',gap:'0.25rem'}}>
            {images.map((_,i)=>(
              <button key={i} onClick={e=>{e.stopPropagation();setCurrent(i);}} style={{width:i===current?'16px':'5px',height:'5px',borderRadius:'999px',background:i===current?'#22c55e':'rgba(255,255,255,0.5)',border:'none',cursor:'pointer',padding:0,transition:'all 0.2s'}}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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
      <button onClick={onClose} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.1)',border:'none',color:'white',borderRadius:'50%',width:'38px',height:'38px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={18}/></button>
      <img src={images[current].url} alt="" onClick={e=>e.stopPropagation()} style={{maxWidth:'92vw',maxHeight:'88vh',objectFit:'contain',borderRadius:'10px'}}/>
      {images.length > 1 && (
        <>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p-1+images.length)%images.length);}} style={{position:'absolute',left:'1rem',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'40px',height:'40px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronLeft size={20}/></button>
          <button onClick={e=>{e.stopPropagation();setCurrent(p=>(p+1)%images.length);}} style={{position:'absolute',right:'1rem',background:'rgba(0,0,0,0.6)',border:'none',color:'white',borderRadius:'50%',width:'40px',height:'40px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronRight size={20}/></button>
        </>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [connStatus, setConnStatus] = useState({ status: 'none' });
  const [connLoading, setConnLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [lightbox, setLightbox] = useState(null);

  const fetchAll = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn || !userId) { router.push('/login'); return; }
    setToken(tkn);
    const me = JSON.parse(userData || '{}');
    setCurrentUser(me);

    // Redirect to own profile
    if (parseInt(userId) === me.id) { router.push('/profile'); return; }

    try {
      const [userRes, postsRes, statusRes, connRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/status/${userId}`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, { headers: { Authorization: `Bearer ${tkn}` } }),
      ]);

      setProfileUser(userRes.data);
      setConnStatus(statusRes.data);
      setConnections(connRes.data);

      const userPosts = postsRes.data.posts.filter(p => p.userId === parseInt(userId));
      setPosts(userPosts);

      const liked = {};
      const counts = {};
      userPosts.forEach(p => {
        counts[p.id] = p._count?.likes || 0;
        liked[p.id] = p.likes?.some(l => l.userId === me.id) || false;
      });
      setLikeCounts(counts);
      setLikedPosts(liked);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) router.push('/users');
    } finally { setLoading(false); }
  }, [userId, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleConnect = async () => {
    setConnLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/send`, { receiverId: parseInt(userId) }, { headers: { Authorization: `Bearer ${token}` } });
      setConnStatus({ status: 'sent', connectionId: res.data.connection.id });
    } catch (err) { alert(err.response?.data?.message || 'Error'); } finally { setConnLoading(false); }
  };

  const handleCancel = async () => {
    setConnLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/cancel`, { receiverId: parseInt(userId) }, { headers: { Authorization: `Bearer ${token}` } });
      setConnStatus({ status: 'none' });
    } catch (err) { console.error(err); } finally { setConnLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect?')) return;
    setConnLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/disconnect`, { userId: parseInt(userId) }, { headers: { Authorization: `Bearer ${token}` } });
      setConnStatus({ status: 'none' });
    } catch (err) { console.error(err); } finally { setConnLoading(false); }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setLikedPosts(prev => ({ ...prev, [postId]: res.data.liked }));
      setLikeCounts(prev => ({ ...prev, [postId]: res.data.count }));
    } catch (err) { console.error(err); }
  };

  const openComments = async (postId) => {
    if (commentOpen === postId) { setCommentOpen(null); return; }
    setCommentOpen(postId);
    if (comments[postId]) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { content: newComment[postId] }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), { ...res.data, replies: [] }] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, _count: { ...p._count, comments: (p._count?.comments || 0) + 1 } } : p));
    } catch (err) { console.error(err); }
  };

  const ConnectButton = () => {
    const { status } = connStatus;
    if (status === 'connected') return (
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        <button onClick={()=>router.push(`/messages?userId=${userId}&userName=${encodeURIComponent(profileUser?.name)}`)}
          className="btn-primary" style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <MessageSquare size={15}/> Message
        </button>
        <button onClick={handleDisconnect} disabled={connLoading} className="btn-outline"
          style={{padding:'0.5rem 1rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem',color:'rgba(239,68,68,0.7)',borderColor:'rgba(239,68,68,0.3)'}}>
          <UserX size={15}/> Disconnect
        </button>
      </div>
    );
    if (status === 'sent') return (
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',padding:'0.5rem 1rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'8px',fontSize:'0.85rem',color:'var(--text2)'}}>
          <UserCheck size={15}/> Request Sent
        </div>
        <button onClick={handleCancel} disabled={connLoading} className="btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}}>
          Cancel
        </button>
      </div>
    );
    if (status === 'received') return (
      <button onClick={()=>router.push('/notifications')} className="btn-primary"
        style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
        <UserCheck size={15}/> Respond to Request
      </button>
    );
    return (
      <button onClick={handleConnect} disabled={connLoading} className="btn-primary"
        style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
        <UserPlus size={15}/> {connLoading ? 'Connecting...' : 'Connect'}
      </button>
    );
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'44px',height:'44px',border:'3px solid rgba(34,197,94,0.2)',borderTop:'3px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!profileUser) return null;

  return (
    <div className="page-bg">
      <Sidebar user={currentUser}/>
      <div className="main-with-sidebar">
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.5rem 3rem',width:'100%'}}>

          {/* Profile Bento */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:'1rem',marginBottom:'2rem'}} className="profile-grid">

            {/* Left Card */}
            <div className="glass-card" style={{padding:'1.75rem',display:'flex',gap:'1.5rem',alignItems:'flex-start',flexWrap:'wrap'}}>
              <div style={{width:'88px',height:'88px',borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(34,197,94,0.3)',flexShrink:0}}>
                {profileUser.avatar ? (
                  <img src={profileUser.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                ) : (
                  <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',fontWeight:800,color:'#22c55e',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    {profileUser.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div style={{flex:1,minWidth:'200px'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                  <div>
                    <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.4rem',color:'white',lineHeight:1.2,marginBottom:'0.35rem'}}>{profileUser.name}</h2>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                      <span className={profileUser.role==='senior'?'badge-senior':'badge-junior'}>{profileUser.role}</span>
                      {profileUser.bloodGroup && (
                        <span style={{color:'#f87171',fontSize:'0.7rem',display:'flex',alignItems:'center',gap:'0.2rem',background:'rgba(239,68,68,0.1)',padding:'2px 8px',borderRadius:'999px',border:'1px solid rgba(239,68,68,0.2)'}}>
                          <Droplets size={10}/>{profileUser.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                  <ConnectButton/>
                </div>
                {profileUser.department && (
                  <p style={{color:'var(--text2)',fontSize:'0.82rem',display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.25rem'}}>
                    <BookOpen size={14} color="#22c55e"/> {profileUser.department} • Batch {profileUser.batch}
                  </p>
                )}
                {profileUser.studentId && (
                  <p style={{color:'var(--text3)',fontSize:'0.78rem',display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.4rem'}}>
                    <MapPin size={13} color="#22c55e"/> ID: {profileUser.studentId}
                  </p>
                )}
                {profileUser.bio && (
                  <p style={{color:'var(--text2)',fontSize:'0.85rem',lineHeight:'1.6',marginBottom:'0.4rem'}}>{profileUser.bio}</p>
                )}
                {profileUser.skills && (
                  <p style={{color:'var(--text3)',fontSize:'0.78rem'}}>🛠️ {profileUser.skills}</p>
                )}
              </div>
            </div>

            {/* Right Stats */}
            <div className="glass-card" style={{padding:'1.5rem',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              {[
                {label:'Posts', value: posts.length, color:'#22c55e'},
                {label:'Connections', value: connStatus.status==='connected'?'Connected':'—', color: connStatus.status==='connected'?'#22c55e':'var(--text2)'},
                {label:'Department', value: profileUser.department||'—', color:'#60a5fa'},
                {label:'Batch', value: profileUser.batch||'—', color:'var(--text2)'},
              ].map((stat,i,arr) => (
                <div key={stat.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem 0',borderBottom:i<arr.length-1?'1px solid rgba(34,197,94,0.08)':'none'}}>
                  <span style={{color:'var(--text2)',fontSize:'0.85rem'}}>{stat.label}</span>
                  <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize: typeof stat.value==='number'?'1.3rem':'0.85rem',color:stat.color}}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(34,197,94,0.1)'}}>
            <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'1.1rem',color:'white'}}>Posts by {profileUser.name?.split(' ')[0]}</h3>
            <span style={{color:'var(--text3)',fontSize:'0.8rem'}}>{posts.length} posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="glass-card" style={{padding:'3rem',textAlign:'center'}}>
              <p style={{color:'var(--text2)',fontSize:'0.875rem'}}>No posts yet.</p>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'0.875rem'}} className="stagger-children">
              {posts.map((post,idx) => (
                <div key={post.id} className="glass-card pulse-hover" style={{padding:'1.1rem',animationDelay:`${idx*0.05}s`,display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <Avatar user={profileUser} size={32} radius="9px"/>
                    <div style={{flex:1}}>
                      <p style={{color:'white',fontWeight:600,fontSize:'0.82rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{profileUser.name}</p>
                      <p style={{color:'var(--text3)',fontSize:'0.68rem'}}>{new Date(post.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                    </div>
                  </div>

                  {post.content && (
                    <p style={{color:'rgba(255,255,255,0.82)',fontSize:'0.85rem',lineHeight:'1.6',marginBottom: post.images?.length>0?'0.5rem':'0.65rem',whiteSpace:'pre-wrap',flex:1}}>{post.content}</p>
                  )}
                  {post.images && post.images.length > 0 && (
                    <ImageCarousel images={post.images} onImageClick={(i)=>setLightbox({images:post.images,index:i})}/>
                  )}

                  {(likeCounts[post.id]>0||post._count?.comments>0) && (
                    <div style={{display:'flex',gap:'0.75rem',marginBottom:'0.4rem',paddingBottom:'0.4rem',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      {likeCounts[post.id]>0 && (
                        <span style={{color:'var(--text3)',fontSize:'0.72rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                          <ThumbsUp size={11} color="#22c55e"/> {likeCounts[post.id]} likes
                        </span>
                      )}
                      {post._count?.comments>0 && (
                        <span style={{color:'var(--text3)',fontSize:'0.72rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
                          <MessageCircle size={11} color="#60a5fa"/> {post._count.comments} comments
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{display:'flex',gap:'0.2rem'}}>
                    <button className={`btn-ghost ${likedPosts[post.id]?'active':''}`} onClick={()=>handleLike(post.id)}
                      style={{color:likedPosts[post.id]?'#22c55e':undefined,fontSize:'0.78rem'}}>
                      <ThumbsUp size={13}/> Like
                    </button>
                    <button className="btn-ghost" onClick={()=>openComments(post.id)}
                      style={{color:commentOpen===post.id?'#60a5fa':undefined,fontSize:'0.78rem'}}>
                      <MessageCircle size={13}/> Comment
                    </button>
                    {connStatus.status==='connected' && (
                      <button className="btn-ghost" onClick={()=>router.push(`/messages?userId=${userId}&userName=${encodeURIComponent(profileUser?.name)}`)}
                        style={{fontSize:'0.78rem',marginLeft:'auto'}}>
                        <MessageSquare size={13}/> Message
                      </button>
                    )}
                  </div>

                  {commentOpen===post.id && (
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'0.6rem',marginTop:'0.4rem',animation:'fadeIn 0.25s ease'}}>
                      <div style={{display:'flex',flexDirection:'column',gap:'0.4rem',marginBottom:'0.5rem',maxHeight:'180px',overflowY:'auto'}}>
                        {!comments[post.id] ? (
                          <p style={{color:'var(--text3)',fontSize:'0.78rem',textAlign:'center'}}>Loading...</p>
                        ) : comments[post.id].length===0 ? (
                          <p style={{color:'var(--text3)',fontSize:'0.78rem',textAlign:'center'}}>No comments yet</p>
                        ) : comments[post.id].map(comment => (
                          <div key={comment.id} style={{display:'flex',gap:'0.4rem',alignItems:'flex-start'}}>
                            <Avatar user={comment.user} size={24} radius="6px"/>
                            <div style={{flex:1}}>
                              <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'8px',padding:'0.35rem 0.6rem'}}>
                                <p style={{color:'#22c55e',fontSize:'0.7rem',fontWeight:700,marginBottom:'0.05rem'}}>{comment.user?.name}</p>
                                <p style={{color:'rgba(255,255,255,0.75)',fontSize:'0.78rem',lineHeight:'1.4'}}>{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={e=>handleComment(e,post.id)} style={{display:'flex',gap:'0.35rem',alignItems:'center'}}>
                        <Avatar user={currentUser} size={24} radius="6px"/>
                        <input type="text" value={newComment[post.id]||''} onChange={e=>setNewComment(prev=>({...prev,[post.id]:e.target.value}))}
                          placeholder="Comment..." className="input-field" style={{fontSize:'0.78rem',padding:'0.32rem 0.65rem',borderRadius:'999px'}}/>
                        <button type="submit" disabled={!newComment[post.id]?.trim()} className="btn-primary" style={{padding:'0.32rem 0.6rem',flexShrink:0}}>
                          <Send size={12}/>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* <Footer/> */}
      </div>

      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={()=>setLightbox(null)}/>}
      <style>{`
        @media(max-width:860px){.profile-grid{grid-template-columns:1fr!important}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}