'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Edit2, Save, X, Camera, Trash2, MapPin, BookOpen, Droplets,
  ThumbsUp, MessageCircle, ChevronLeft, ChevronRight, Send, Users, Calendar
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
// import Footer from '../components/Footer';
import Avatar from '../components/Avatar';
import Link from 'next/link';

const DEPARTMENTS = ['CSE','CCE','EEE','ETE','Civil Engineering','Pharmacy','BBA','MBA','English','Arabic','LIS','Law','Economics & Banking','QSIS','DIS','SHIS'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

// ── Modals ──────────────────────────────────────────────────────────

function LikesModal({ postId, token, count, onClose }) {
  const [likers, setLikers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/likes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setLikers(res.data)).catch(() => setLikers([]))
      .finally(() => setLoading(false));
  }, [postId, token]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" style={{width:'100%',maxWidth:'340px',padding:'1.25rem',maxHeight:'65vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem',flexShrink:0}}>
          <h3 style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>👍 {count} {count===1?'Like':'Likes'}</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:'0.4rem'}}>
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

function CommentsModal({ postId, token, count, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setComments(res.data)).catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId, token]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" style={{width:'100%',maxWidth:'420px',padding:'1.25rem',maxHeight:'70vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.875rem',flexShrink:0}}>
          <h3 style={{color:'white',fontWeight:700,fontSize:'0.95rem'}}>💬 {count} Comments</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.4)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:'0.6rem'}}>
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

// ── Image helpers ────────────────────────────────────────────────────

function ImageCarousel({ images, onImageClick }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div style={{position:'relative',borderRadius:'10px',overflow:'hidden',background:'rgba(0,0,0,0.3)',marginBottom:'0.5rem'}}>
      <img src={images[current].url} alt="" style={{width:'100%',maxHeight:'360px',objectFit:'contain',display:'block',cursor:'zoom-in'}} onClick={()=>onImageClick(current)}/>
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

// ── Main Component ───────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  const [editData, setEditData] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const [commentOpen, setCommentOpen] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [likesModal, setLikesModal] = useState(null);
  const [commentsModal, setCommentsModal] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    const currentUser = JSON.parse(userData || '{}');
    try {
      const [userRes, postsRes, connRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, { headers: { Authorization: `Bearer ${tkn}` } }),
      ]);
      const freshUser = userRes.data;
      setUser(freshUser);
      setConnections(connRes.data);
      setEditData({
        name: freshUser.name||'', bio: freshUser.bio||'', skills: freshUser.skills||'',
        department: freshUser.department||'', batch: freshUser.batch||'',
        bloodGroup: freshUser.bloodGroup||'', gender: freshUser.gender||'male',
        studentId: freshUser.studentId||'',
      });
      const myPosts = postsRes.data.posts.filter(p => p.userId === freshUser.id);
      setPosts(myPosts);
      const liked = {};
      const counts = {};
      myPosts.forEach(p => {
        counts[p.id] = p._count?.likes||0;
        liked[p.id] = p.likes?.some(l => l.userId===freshUser.id)||false;
      });
      setLikeCounts(counts);
      setLikedPosts(liked);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, editData, { headers: { Authorization: `Bearer ${token}` } });
      const updated = res.data.user;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
    } catch { alert('Failed to save'); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type':'multipart/form-data' } });
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
      localStorage.setItem('user', JSON.stringify({ ...user, avatar: res.data.avatar }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch {}
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setLikedPosts(prev => ({ ...prev, [postId]: res.data.liked }));
      setLikeCounts(prev => ({ ...prev, [postId]: res.data.count }));
    } catch {}
  };

  const openComments = async (postId) => {
    if (commentOpen === postId) { setCommentOpen(null); return; }
    setCommentOpen(postId);
    if (comments[postId]) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: res.data }));
    } catch {}
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, { content: newComment[postId] }, { headers: { Authorization: `Bearer ${token}` } });
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId]||[]), { ...res.data, replies:[] }] }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => p.id===postId ? { ...p, _count: { ...p._count, comments:(p._count?.comments||0)+1 } } : p));
    } catch {}
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:'44px',height:'44px',border:'3px solid rgba(34,197,94,0.2)',borderTop:'3px solid #22c55e',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="page-bg" onClick={()=>activeMenu&&setActiveMenu(null)}>
      <Sidebar user={user}/>
      <div className="main-with-sidebar">
        <div style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.5rem 3rem',width:'100%'}}>

          {/* Profile Bento */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'1rem',marginBottom:'2rem'}} className="profile-grid">

            {/* Left */}
            <div className="glass-card" style={{padding:'1.75rem',display:'flex',gap:'1.5rem',alignItems:'flex-start',flexWrap:'wrap'}}>
              {/* Avatar */}
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:'96px',height:'96px',borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(34,197,94,0.3)'}}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(15,61,46,0.3))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',fontWeight:800,color:'#22c55e'}}>
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <button onClick={()=>fileInputRef.current?.click()} disabled={uploading}
                  style={{position:'absolute',bottom:0,right:0,background:'#16a34a',border:'3px solid #0f150d',color:'white',borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'transform 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                  <Camera size={13}/>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{display:'none'}}/>
              </div>

              {/* Info */}
              <div style={{flex:1,minWidth:'200px'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
                  <div>
                    <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.4rem',color:'white',lineHeight:1.2,marginBottom:'0.35rem'}}>{user?.name}</h2>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                      <span className={user?.role==='senior'?'badge-senior':'badge-junior'}>{user?.role}</span>
                      {user?.bloodGroup && (
                        <span style={{color:'#f87171',fontSize:'0.7rem',display:'flex',alignItems:'center',gap:'0.2rem',background:'rgba(239,68,68,0.1)',padding:'2px 8px',borderRadius:'999px',border:'1px solid rgba(239,68,68,0.2)'}}>
                          <Droplets size={10}/>{user.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={()=>setEditing(!editing)} className={editing?'btn-outline':'btn-primary'} style={{padding:'0.45rem 1rem',fontSize:'0.82rem',display:'flex',alignItems:'center',gap:'0.35rem',flexShrink:0}}>
                    {editing ? <><X size={14}/> Cancel</> : <><Edit2 size={14}/> Edit Profile</>}
                  </button>
                </div>

                {user?.department && (
                  <p style={{color:'var(--text2)',fontSize:'0.82rem',display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.25rem'}}>
                    <BookOpen size={14} color="#22c55e"/> {user.department} • Batch {user.batch}
                  </p>
                )}
                {user?.studentId && (
                  <p style={{color:'var(--text3)',fontSize:'0.78rem',display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:'0.5rem'}}>
                    <MapPin size={13} color="#22c55e"/> ID: {user.studentId}
                  </p>
                )}
                {user?.bio && !editing && (
                  <p style={{color:'var(--text2)',fontSize:'0.85rem',lineHeight:'1.6',marginBottom:'0.4rem'}}>{user.bio}</p>
                )}
                {user?.skills && !editing && (
                  <p style={{color:'var(--text3)',fontSize:'0.78rem'}}>🛠️ {user.skills}</p>
                )}

                {/* Edit Form */}
                {editing && (
                  <div style={{marginTop:'1rem',borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:'1rem',animation:'fadeIn 0.3s ease'}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.65rem',marginBottom:'0.65rem'}}>
                      {[
                        {label:'Full Name',field:'name',placeholder:'Your name'},
                        {label:'Student ID',field:'studentId',placeholder:'C241268'},
                        {label:'Batch',field:'batch',placeholder:'57'},
                      ].map(f => (
                        <div key={f.field}>
                          <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>{f.label}</label>
                          <input type="text" value={editData[f.field]||''} onChange={e=>setEditData(p=>({...p,[f.field]:e.target.value}))} className="input-field" placeholder={f.placeholder} style={{fontSize:'0.85rem'}}/>
                        </div>
                      ))}
                      <div>
                        <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Department</label>
                        <select value={editData.department||''} onChange={e=>setEditData(p=>({...p,department:e.target.value}))} className="input-field" style={{fontSize:'0.85rem'}}>
                          <option value="">Select</option>
                          {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Blood Group</label>
                        <select value={editData.bloodGroup||''} onChange={e=>setEditData(p=>({...p,bloodGroup:e.target.value}))} className="input-field" style={{fontSize:'0.85rem'}}>
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Gender</label>
                        <select value={editData.gender||'male'} onChange={e=>setEditData(p=>({...p,gender:e.target.value}))} className="input-field" style={{fontSize:'0.85rem'}}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div style={{gridColumn:'1/-1'}}>
                        <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>Skills</label>
                        <input type="text" value={editData.skills||''} onChange={e=>setEditData(p=>({...p,skills:e.target.value}))} className="input-field" placeholder="React, Python, Figma..." style={{fontSize:'0.85rem'}}/>
                      </div>
                      <div style={{gridColumn:'1/-1'}}>
                        <label style={{color:'var(--text3)',fontSize:'0.72rem',fontWeight:600,display:'block',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>About Me</label>
                        <textarea value={editData.bio||''} onChange={e=>setEditData(p=>({...p,bio:e.target.value}))} className="input-field" rows={2} style={{resize:'none',fontSize:'0.85rem'}} placeholder="Tell the community about yourself..."/>
                      </div>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="btn-primary" style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.35rem'}}>
                      {saving?'Saving...':<><Save size={14}/> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Stats */}
            <div className="glass-card" style={{padding:'1.5rem',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              {[
                {label:'Connections', value:connections.length, color:'#22c55e'},
                {label:'Posts', value:posts.length, color:'#60a5fa'},
                {label:'Department', value:user?.department||'—', color:'#a78bfa'},
                {label:'Member Since', value:user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—', color:'var(--text2)'},
              ].map((stat,i,arr) => (
                <div key={stat.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.875rem 0',borderBottom:i<arr.length-1?'1px solid rgba(34,197,94,0.08)':'none'}}>
                  <span style={{color:'var(--text2)',fontSize:'0.85rem'}}>{stat.label}</span>
                  <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:typeof stat.value==='number'?'1.3rem':'0.85rem',color:stat.color}}>
                    {stat.value}
                  </span>
                </div>
              ))}
              {user?.avatar && (
                <button onClick={async()=>{
                  if(!confirm('Remove avatar?')) return;
                  try {
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`,{headers:{Authorization:`Bearer ${token}`}});
                    setUser(prev=>({...prev,avatar:null}));
                    localStorage.setItem('user',JSON.stringify({...user,avatar:null}));
                  } catch{}
                }} style={{marginTop:'0.875rem',color:'rgba(239,68,68,0.6)',background:'transparent',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'0.4rem',cursor:'pointer',fontSize:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.35rem',transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#f87171';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(239,68,68,0.6)';}}>
                  <Trash2 size={13}/> Remove Avatar
                </button>
              )}
            </div>
          </div>

          {/* Posts */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',paddingBottom:'0.75rem',borderBottom:'1px solid rgba(34,197,94,0.1)'}}>
            <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:'1.1rem',color:'white'}}>Recent Activity</h3>
            <span style={{color:'var(--text3)',fontSize:'0.8rem'}}>{posts.length} posts</span>
          </div>

          {posts.length === 0 ? (
            <div className="glass-card" style={{padding:'3rem',textAlign:'center'}}>
              <p style={{color:'var(--text2)',fontSize:'0.875rem',marginBottom:'0.75rem'}}>No posts yet.</p>
              <Link href="/dashboard" className="btn-primary" style={{display:'inline-flex',padding:'0.45rem 1.25rem',fontSize:'0.82rem',textDecoration:'none'}}>
                Share your first post
              </Link>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'0.875rem'}} className="stagger-children">
              {posts.map((post,idx) => (
                <div key={post.id} className="glass-card pulse-hover" style={{padding:'1.1rem',animationDelay:`${idx*0.05}s`,display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.65rem'}}>
                    <Avatar user={user} size={32} radius="9px"/>
                    <div style={{flex:1}}>
                      <p style={{color:'white',fontWeight:600,fontSize:'0.82rem',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{user?.name}</p>
                      <p style={{color:'var(--text3)',fontSize:'0.68rem'}}>{new Date(post.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
                    </div>
                    <div style={{position:'relative',flexShrink:0}}>
                      <button onClick={e=>{e.stopPropagation();setActiveMenu(activeMenu===post.id?null:post.id);}} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',padding:'0.3rem',borderRadius:'7px',transition:'all 0.2s'}}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        ⋯
                      </button>
                      {activeMenu===post.id && (
                        <div className="dropdown-menu" style={{position:'absolute',right:0,top:'2rem',zIndex:20}}>
                          <button className="dropdown-item dropdown-item-danger" onClick={()=>handleDeletePost(post.id)}>
                            <Trash2 size={13}/> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {post.content && (
                    <p style={{color:'rgba(255,255,255,0.82)',fontSize:'0.85rem',lineHeight:'1.6',marginBottom:post.images?.length>0?'0.5rem':'0.65rem',whiteSpace:'pre-wrap',flex:1}}>
                      {post.content}
                    </p>
                  )}
                  {post.images && post.images.length > 0 && (
                    <ImageCarousel images={post.images} onImageClick={(i)=>setLightbox({images:post.images,index:i})}/>
                  )}

                  {/* Counts — clickable */}
                  {(likeCounts[post.id]>0||post._count?.comments>0) && (
                    <div style={{display:'flex',gap:'0.75rem',marginBottom:'0.4rem',paddingBottom:'0.4rem',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                      {likeCounts[post.id]>0 && (
                        <button onClick={()=>setLikesModal({postId:post.id,count:likeCounts[post.id]})}
                          style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'0.72rem',display:'flex',alignItems:'center',gap:'0.25rem',transition:'color 0.15s',padding:0}}
                          onMouseEnter={e=>e.currentTarget.style.color='#22c55e'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                          <ThumbsUp size={11} color="#22c55e"/> {likeCounts[post.id]} likes
                        </button>
                      )}
                      {post._count?.comments>0 && (
                        <button onClick={()=>setCommentsModal({postId:post.id,count:post._count.comments})}
                          style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'0.72rem',display:'flex',alignItems:'center',gap:'0.25rem',transition:'color 0.15s',padding:0}}
                          onMouseEnter={e=>e.currentTarget.style.color='#60a5fa'}
                          onMouseLeave={e=>e.currentTarget.style.color='var(--text3)'}>
                          <MessageCircle size={11} color="#60a5fa"/> {post._count.comments} comments
                        </button>
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
                        <Avatar user={user} size={24} radius="6px"/>
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

      {/* Modals */}
      {likesModal && (
        <LikesModal postId={likesModal.postId} token={token} count={likesModal.count} onClose={()=>setLikesModal(null)}/>
      )}
      {commentsModal && (
        <CommentsModal postId={commentsModal.postId} token={token} count={commentsModal.count} onClose={()=>setCommentsModal(null)}/>
      )}
      {lightbox && (
        <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={()=>setLightbox(null)}/>
      )}

      <style>{`
        @media(max-width:860px){.profile-grid{grid-template-columns:1fr!important}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}