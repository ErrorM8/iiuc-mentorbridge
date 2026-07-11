'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Edit2, X, Check, Trash2, MoreVertical, Send } from 'lucide-react';
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

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token) { router.push('/login'); return; }
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${token}` } })
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
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, formData, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Profile updated!');
      setIsEditing(false);
      setUserData({ ...userData, ...formData });
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Something went wrong'); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (err) { console.error(err); }
  };

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, { content: editContent }, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
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
    <div className="page-bg" onClick={() => { activeMenu && setActiveMenu(null); }}>
      <Navbar user={userData}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Profile Card */}
        <div className="post-card fade-in" style={{marginBottom:'0.65rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.875rem', marginBottom:'0.65rem'}}>
            <div className="avatar" style={{width:'52px', height:'52px', fontSize:'1.3rem', borderRadius:'14px'}}>
              {userData?.name?.charAt(0).toUpperCase()}
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
            <button onClick={() => setIsEditing(!isEditing)} className={isEditing ? 'btn-outline' : 'btn-primary'} style={{padding:'0.4rem 0.875rem', fontSize:'0.78rem', flexShrink:0}}>
              {isEditing ? <><X size={13}/> Cancel</> : <><Edit2 size={13}/> Edit</>}
            </button>
          </div>

          {message && <div className="alert-success" style={{marginBottom:'0.65rem'}}><Check size={14}/> {message}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit} style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.75rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'0.6rem'}}>
                <div style={{gridColumn:'1/-1'}}>
                  <L>Full Name</L>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field"/>
                </div>
                <div>
                  <L>Batch</L>
                  <input type="text" name="batch" value={formData.batch} onChange={handleChange} className="input-field" placeholder="e.g. 57"/>
                </div>
                <div>
                  <L>Department</L>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="e.g. CSE"/>
                </div>
                <div>
                  <L>Gender</L>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <L>Skills</L>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="React, Node.js..."/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <L>About Me</L>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} className="input-field" style={{resize:'none'}} placeholder="Tell others about yourself..."/>
                </div>
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
          <h3 style={{color:'#22c55e', fontWeight:600, marginBottom:'0.65rem', fontSize:'0.875rem'}}>
            My Posts ({posts.length})
          </h3>
          {posts.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.8rem'}}>No posts yet.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {posts.map((post) => (
                <div key={post.id} style={{background:'rgba(255,255,255,0.03)', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.06)'}}>

                  {/* Post Header */}
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'0.6rem 0.8rem', paddingBottom: editingPost === post.id ? '0.4rem' : '0.6rem'}}>
                    <div style={{flex:1}}>
                      {editingPost === post.id ? (
                        <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="input-field"
                            style={{resize:'none', fontSize:'0.8rem', padding:'0.4rem 0.65rem'}}
                            rows={3}
                            autoFocus
                          />
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
                          <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.68rem', marginTop:'0.25rem'}}>{new Date(post.createdAt).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>

                    {/* 3-dot Menu */}
                    {editingPost !== post.id && (
                      <div style={{position:'relative', flexShrink:0, marginLeft:'0.5rem'}}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === post.id ? null : post.id); }}
                          style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', padding:'0.25rem', borderRadius:'6px', display:'flex', alignItems:'center'}}
                          onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
                          onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.3)'}
                        >
                          <MoreVertical size={15}/>
                        </button>

                        {activeMenu === post.id && (
                          <div className="dropdown-menu" style={{position:'absolute', right:0, top:'1.75rem', zIndex:20}}>
                            <button className="dropdown-item" onClick={() => {
                              setEditingPost(post.id);
                              setEditContent(post.content);
                              setActiveMenu(null);
                            }}>
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
    </div>
  );
}