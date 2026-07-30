'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { UserPlus, UserCheck, UserX, MapPin, BookOpen, Droplets, ThumbsUp, MessageCircle, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Avatar from '../../components/Avatar';

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [connectionId, setConnectionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [token, setToken] = useState('');

  const fetchProfile = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setCurrentUser(JSON.parse(userData));
    try {
      const [userRes, postsRes, statusRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/status/${id}`, { headers: { Authorization: `Bearer ${tkn}` } })
      ]);
      setProfile(userRes.data);
      setPosts(postsRes.data.posts.filter(p => p.userId === parseInt(id)));
      setConnectionStatus(statusRes.data.status);
      setConnectionId(statusRes.data.connectionId);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/connections/send`,
        { receiverId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionStatus('sent');
      setConnectionId(res.data.connection.id);
    } catch (err) { alert(err.response?.data?.message || 'Something went wrong'); }
    finally { setActionLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    setActionLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/connections/disconnect`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectionStatus('none');
      setConnectionId(null);
    } catch (err) { console.error(err); } finally { setActionLoading(false); }
  };

  const ConnectButton = () => {
    const handleAccept = async () => {
      setActionLoading(true);
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`, { status: 'accepted' }, { headers: { Authorization: `Bearer ${token}` } });
        setConnectionStatus('connected');
      } catch (err) { console.error(err); } finally { setActionLoading(false); }
    };

    const handleDecline = async () => {
      setActionLoading(true);
      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`, { status: 'rejected' }, { headers: { Authorization: `Bearer ${token}` } });
        setConnectionStatus('none');
        setConnectionId(null);
      } catch (err) { console.error(err); } finally { setActionLoading(false); }
    };

    const handleCancel = async () => {
      if (!confirm('Cancel connection request?')) return;
      setActionLoading(true);
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/cancel`, { receiverId: id }, { headers: { Authorization: `Bearer ${token}` } });
        setConnectionStatus('none');
        setConnectionId(null);
      } catch (err) { console.error(err); } finally { setActionLoading(false); }
    };

    if (connectionStatus === 'none') return (
      <button onClick={handleConnect} disabled={actionLoading} className="btn-primary" style={{padding:'0.45rem 0.875rem', fontSize:'0.8rem', flexShrink:0}}>
        <UserPlus size={13}/> {actionLoading ? '...' : 'Connect'}
      </button>
    );

    if (connectionStatus === 'sent') return (
      <div style={{display:'flex', gap:'0.4rem', alignItems:'center', flexShrink:0}}>
        <span style={{color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.25rem'}}>
          <UserCheck size={13}/> Request Sent
        </span>
        <button onClick={handleCancel} disabled={actionLoading} className="btn-danger" style={{padding:'0.35rem 0.65rem', fontSize:'0.75rem'}}>
          {actionLoading ? '...' : 'Cancel'}
        </button>
      </div>
    );

    if (connectionStatus === 'received') return (
      <div style={{display:'flex', gap:'0.4rem', flexShrink:0}}>
        <button onClick={handleAccept} disabled={actionLoading} className="btn-primary" style={{padding:'0.45rem 0.875rem', fontSize:'0.8rem'}}>
          <UserCheck size={13}/> {actionLoading ? '...' : 'Accept'}
        </button>
        <button onClick={handleDecline} disabled={actionLoading} className="btn-danger" style={{padding:'0.45rem 0.875rem', fontSize:'0.8rem'}}>
          <UserX size={13}/> {actionLoading ? '...' : 'Decline'}
        </button>
      </div>
    );

    if (connectionStatus === 'connected') return (
      <div style={{display:'flex', gap:'0.4rem', flexShrink:0, alignItems:'center'}}>
        <button onClick={() => router.push(`/messages?userId=${id}&userName=${profile?.name}`)} className="btn-primary" style={{padding:'0.45rem 0.875rem', fontSize:'0.8rem'}}>
          <MessageSquare size={13}/> Message
        </button>
        <button onClick={handleDisconnect} disabled={actionLoading} className="btn-danger" style={{padding:'0.45rem 0.875rem', fontSize:'0.8rem'}}>
          <UserX size={12}/> {actionLoading ? '...' : 'Disconnect'}
        </button>
      </div>
    );
    return null;
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  const isOwnProfile = currentUser?.id === parseInt(id);

  return (
    <div className="page-bg">
      <Navbar user={currentUser}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        <div className="post-card fade-in" style={{marginBottom:'0.65rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.875rem'}}>
            <Avatar user={profile} size={62} radius="16px"/>
            <div style={{flex:1}}>
              <h2 style={{fontWeight:700, color:'white', fontSize:'1.1rem'}}>{profile?.name}</h2>
              <div style={{display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap', marginTop:'0.2rem'}}>
                <span className={profile?.role === 'senior' ? 'badge-senior' : 'badge-junior'}>{profile?.role}</span>
                {/* Connected badge - subtle under name */}
                {connectionStatus === 'connected' && !isOwnProfile && (
                  <span style={{color:'rgba(34,197,94,0.7)', fontSize:'0.68rem', display:'flex', alignItems:'center', gap:'0.2rem'}}>
                    <UserCheck size={11}/> Connected
                  </span>
                )}
                {profile?.bloodGroup && (
                  <span style={{color:'#f87171', fontSize:'0.68rem', display:'flex', alignItems:'center', gap:'0.2rem'}}>
                    <Droplets size={10}/>{profile.bloodGroup}
                  </span>
                )}
                {profile?.gender && <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.68rem'}}>• {profile.gender}</span>}
              </div>
            </div>
            {!isOwnProfile && (
              <div style={{flexShrink:0}}>
                <ConnectButton/>
              </div>
            )}
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'0.4rem', paddingTop:'0.65rem', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            {profile?.department && (
              <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <BookOpen size={13} color="#22c55e"/> {profile.department} • Batch {profile.batch}
              </p>
            )}
            {profile?.studentId && (
              <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <MapPin size={13} color="#22c55e"/> Student ID: {profile.studentId}
              </p>
            )}
            {profile?.bio && <p style={{color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', marginTop:'0.25rem'}}>📝 {profile.bio}</p>}
            {profile?.skills && <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.78rem'}}>🛠️ {profile.skills}</p>}
          </div>
        </div>

        <div className="post-card">
          <h3 style={{color:'#22c55e', fontWeight:600, marginBottom:'0.65rem', fontSize:'0.875rem'}}>Posts ({posts.length})</h3>
          {posts.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.8rem'}}>No posts yet.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {posts.map((post) => (
                <div key={post.id} style={{background:'rgba(255,255,255,0.03)', borderRadius:'9px', padding:'0.65rem 0.85rem', border:'1px solid rgba(255,255,255,0.06)'}}>
                  {post.content && <p style={{color:'rgba(255,255,255,0.75)', fontSize:'0.82rem', lineHeight:'1.5'}}>{post.content}</p>}
                  {post.images && post.images.length > 0 && (
                    <div style={{display:'flex', gap:'0.35rem', marginTop:'0.4rem', flexWrap:'wrap'}}>
                      {post.images.map((img, i) => (
                        <img key={i} src={img.url} alt="" style={{width:'70px', height:'70px', objectFit:'cover', borderRadius:'6px', cursor:'pointer'}} onClick={() => window.open(img.url, '_blank')}/>
                      ))}
                    </div>
                  )}
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem', paddingTop:'0.4rem', borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                    <span style={{color:'rgba(255,255,255,0.2)', fontSize:'0.68rem'}}>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div style={{marginLeft:'auto', display:'flex', gap:'0.25rem'}}>
                      <button className="btn-ghost" style={{fontSize:'0.72rem', padding:'0.2rem 0.5rem'}}><ThumbsUp size={11}/> Like</button>
                      <button className="btn-ghost" style={{fontSize:'0.72rem', padding:'0.2rem 0.5rem'}}><MessageCircle size={11}/> Comment</button>
                    </div>
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