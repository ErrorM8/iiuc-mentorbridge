'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Edit2, X, Check, Trash2, MoreVertical, Send, Camera, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name:'', bio:'', skills:'', batch:'', department:'', gender:'' });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [token, setToken] = useState('');
  const fileInputRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${tkn}` } })
      ]);
      const u = userRes.data;
      setUserData(u);
      setFormData({ name:u.name||'', bio:u.bio||'', skills:u.skills||'', batch:u.batch||'', department:u.department||'', gender:u.gender||'' });
      setPosts(postsRes.data.posts.filter(p => p.userId === user.id));
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Profile updated!');
      setIsEditing(false);
      setUserData({ ...userData, ...formData });
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...formData }));
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Something went wrong'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setUserData(prev => ({ ...prev, avatar: res.data.user.avatar }));
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: res.data.user.avatar }));
      setMessage('Profile picture updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Upload failed'); } finally { setAvatarLoading(false); }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Remove profile picture?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, avatar: null }));
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: null }));
    } catch { console.error('Remove avatar failed'); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: res.data.post.content } : p));
      setEditingPost(null);
      setEditContent('');
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const L = ({children}) => <label style={{color:'rgba(255,255,255,0.55)', fontSize:'0.72rem', fontWeight:600, display:'block', marginBottom:'0.28rem'}}>{children}</label>;

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  return (
    <div className="page-bg" onClick={() => activeMenu && setActiveMenu(null)}>
      <Navbar user={userData}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Profile Card */}
        <div className="post-card fade-in" style={{marginBottom:'0.65rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'0.65rem'}}>

            {/* Avatar */}
            <div style={{position:'relative', flexShrink:0}}>
              <div style={{width:'60px', height:'60px', borderRadius:'14px', overflow:'hidden', border:'2px solid rgba(34,197,94,0.3)', position:'relative'}}>
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                ) : (
                  <div className="avatar" style={{width:'60px', height:'60px', fontSize:'1.4rem', borderRadius:'14px'}}>
                    {userData?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {avatarLoading && (
                  <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <div style={{width:'20px', height:'20px', border:'2px solid #22c55e', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite'}}/>
                  </div>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()}
                style={{position:'absolute', bottom:'-4px', right:'-4px', width:'22px', height:'22px', borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#0f3d2e)', border:'2px solid #1e2420', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <Camera size={11} color="white"/>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}}/>
            </div>

            <div style={{flex:1}}>
              <h2 style={{fontWeight:700, color:'white', fontSize:'1rem'}}>{userData?.name}</h2>
              <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>{userData?.department} • Batch {userData?.batch}</p>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.2rem', flexWrap:'wrap'}}>
                <span className={userData?.role === 'senior' ? 'badge-senior' : 'badge-junior'}>{userData?.role}</span>
                {userData?.bloodGroup && <span style={{color:'#f87171', fontSize:'0.68rem'}}>🩸 {userData.bloodGroup}</span>}
                {userData?.gender && <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.68rem'}}>• {userData.gender}</span>}
                {userData?.studentId && <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.68rem'}}>• ID: {userData.studentId}</span>}
              </div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'0.35rem', alignItems:'flex-end', flexShrink:0}}>
              <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'btn-outline' : 'btn-primary'} style={{padding:'0.4rem 0.875rem', fontSize:'0.78rem'}}>
                {isEditing ? <><X size={13}/> Cancel</> : <><Edit2 size={13}/> Edit</>}
              </button>
              {userData?.avatar && (
                <button onClick={handleRemoveAvatar} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'0.7rem', display:'flex', alignItems:'center', gap:'0.2rem'}}
                  onMouseEnter={e => e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                  <Trash2 size={11}/> Remove photo
                </button>
              )}
            </div>
          </div>

          {message && <div className="alert-success" style={{marginBottom:'0.65rem'}}><Check size={14}/> {message}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit} style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.75rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'0.6rem'}}>
                <div style={{gridColumn:'1/-1'}}><L>Full Name</L><input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field"/></div>
                <div><L>Batch</L><input type="text" name="batch" value={formData.batch} onChange={handleChange} className="input-field" placeholder="e.g. 57"/></div>
                <div><L>Department</L><input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="e.g. CSE"/></div>
                <div><L>Gender</L>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><L>Skills</L><input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="React, Node.js..."/></div>
                <div style={{gridColumn:'1/-1'}}><L>About Me</L><textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} className="input-field" style={{resize:'none'}} placeholder="Tell others about yourself..."/></div>
              </div>
              <button type="submit" className="btn-primary" style={{width:'100%', padding:'0.5rem'}}>
                <Check size={14}/> Save Changes
              </button>
            </form>
          ) : (
            <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.65rem', display:'flex', flexDirection:'column', gap:'0.3rem'}}>
              {userData?.bio && <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.82rem'}}>📝 {userData.bio}</p>}
              {userData?.skills && <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.78rem'}}>🛠️ {userData.skills}</p>}
              {!userData?.bio && !userData?.skills && <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.78rem'}}>No bio yet. Click Edit to add one.</p>}
            </div>
          )}
        </div>

        {/* My Posts */}
        <div className="post-card" onClick={(e) => e.stopPropagation()}>
          <h3 style={{color:'#22c55e', fontWeight:600, marginBottom:'0.65rem', fontSize:'0.875rem'}}>My Posts ({posts.length})</h3>
          {posts.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.8rem'}}>No posts yet.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {posts.map((post) => (
                <div key={post.id} style={{background:'rgba(255,255,255,0.03)', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'0.6rem 0.8rem', paddingBottom: editingPost === post.id ? '0.4rem' : '0.6rem'}}>
                    <div style={{flex:1}}>
                      {editingPost === post.id ? (
                        <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
                          <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                            className="input-field" style={{resize:'none', fontSize:'0.8rem', padding:'0.4rem 0.65rem'}} rows={3} autoFocus/>
                          <div style={{display:'flex', gap:'0.4rem'}}>
                            <button onClick={() => handleEditPost(post.id)} className="btn-primary" style={{padding:'0.35rem 0.75rem', fontSize:'0.75rem'}}>
                              <Send size={12}/> Save
                            </button>
                            <button onClick={() => { setEditingPost(null); setEditContent(''); }} className="btn-outline" style={{padding:'0.35rem 0.75rem', fontSize:'0.75rem'}}>
                              <X size={12}/> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p style={{color:'rgba(255,255,255,0.7)', fontSize:'0.8rem', lineHeight:'1.5'}}>{post.content}</p>
                          {post.images && post.images.length > 0 && (
                            <div style={{display:'flex', gap:'0.35rem', marginTop:'0.4rem', flexWrap:'wrap'}}>
                              {post.images.map((img, i) => (
                                <img key={i} src={img.url} alt="" style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'6px', cursor:'pointer'}} onClick={() => window.open(img.url, '_blank')}/>
                              ))}
                            </div>
                          )}
                          <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.68rem', marginTop:'0.25rem'}}>{new Date(post.createdAt).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>

                    {editingPost !== post.id && (
                      <div style={{position:'relative', flexShrink:0, marginLeft:'0.5rem'}}>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === post.id ? null : post.id); }}
                          style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'0.25rem', borderRadius:'6px', display:'flex', alignItems:'center'}}
                          onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
                          <MoreVertical size={15}/>
                        </button>
                        {activeMenu === post.id && (
                          <div className="dropdown-menu" style={{position:'absolute', right:0, top:'1.75rem', zIndex:20}}>
                            <button className="dropdown-item" onClick={() => { setEditingPost(post.id); setEditContent(post.content); setActiveMenu(null); }}>
                              <Edit2 size={13}/> Edit
                            </button>
                            <button className="dropdown-item dropdown-item-danger" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 size={13}/> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}