'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, UserX, MessageSquare, Users, Bell, Link2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function UsersPage() {
  const router = useRouter();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [requests, setRequests] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [sendingTo, setSendingTo] = useState(null);
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('all');

  const fetchAll = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    const currentUser = JSON.parse(userData || '{}');
    if (userData) setUser(currentUser);

    try {
      const [usersRes, reqRes, connRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/requests`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/my`, { headers: { Authorization: `Bearer ${tkn}` } }),
      ]);

      const users = usersRes.data.filter(u => u.id !== currentUser.id);
      setAllUsers(users);
      setRequests(reqRes.data);

      const connected = connRes.data.map(conn =>
        conn.senderId === currentUser.id ? conn.receiver : conn.sender
      );
      setConnectedUsers(connected);

      // Fetch statuses
      const statuses = {};
      await Promise.all(users.map(async (u) => {
        try {
          const statusRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/status/${u.id}`, { headers: { Authorization: `Bearer ${tkn}` } });
          statuses[u.id] = statusRes.data;
        } catch { statuses[u.id] = { status: 'none' }; }
      }));
      setConnectionStatuses(statuses);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const sendRequest = async (receiverId) => {
    setSendingTo(receiverId);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/send`, { receiverId }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [receiverId]: { status: 'sent', connectionId: res.data.connection.id } }));
    } catch (err) { alert(err.response?.data?.message || 'Something went wrong'); }
    finally { setSendingTo(null); }
  };

  const cancelRequest = async (receiverId) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/cancel`, { receiverId }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [receiverId]: { status: 'none' } }));
    } catch (err) { console.error(err); }
  };

  const acceptRequest = async (connectionId, senderId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`, { status: 'accepted' }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [senderId]: { status: 'connected' } }));
      setRequests(prev => prev.filter(r => r.id !== connectionId));
      const u = allUsers.find(u => u.id === senderId);
      if (u) setConnectedUsers(prev => [...prev, u]);
    } catch (err) { console.error(err); }
  };

  const declineRequest = async (connectionId, senderId) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`, { status: 'rejected' }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [senderId]: { status: 'none' } }));
      setRequests(prev => prev.filter(r => r.id !== connectionId));
    } catch (err) { console.error(err); }
  };

  const disconnect = async (userId) => {
    if (!confirm('Disconnect?')) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/disconnect`, { userId }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [userId]: { status: 'none' } }));
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) { console.error(err); }
  };

  const connectedIds = new Set(connectedUsers.map(u => u.id));
  const requestSenderIds = new Set(requests.map(r => r.senderId));

  const filteredUsers = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = !department || u.department?.toLowerCase().includes(department.toLowerCase());
    const matchRole = !role || u.role === role;
    return matchSearch && matchDept && matchRole;
  });

  // Tab filtered
  const suggestions = filteredUsers.filter(u => !connectedIds.has(u.id) && !requestSenderIds.has(u.id));
  const connectedList = filteredUsers.filter(u => connectedIds.has(u.id));

  const ConnectBtn = ({ u }) => {
    const status = connectionStatuses[u.id]?.status || 'none';
    const connectionId = connectionStatuses[u.id]?.connectionId;

    if (status === 'connected') return (
      <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
        <button onClick={() => router.push(`/messages?userId=${u.id}&userName=${encodeURIComponent(u.name)}`)}
          className="btn-primary" style={{width:'100%', padding:'0.4rem', fontSize:'0.78rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem'}}>
          <MessageSquare size={12}/> Message
        </button>
        <button onClick={() => disconnect(u.id)}
          className="btn-danger" style={{width:'100%', padding:'0.35rem', fontSize:'0.72rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem'}}>
          <UserX size={12}/> Disconnect
        </button>
      </div>
    );
    if (status === 'sent') return (
      <div style={{display:'flex', gap:'0.3rem'}}>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.3rem', padding:'0.4rem', background:'rgba(255,255,255,0.04)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)'}}>
          <UserCheck size={12} color="rgba(255,255,255,0.4)"/>
          <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.75rem'}}>Sent</span>
        </div>
        <button onClick={() => cancelRequest(u.id)} className="btn-danger" style={{padding:'0.4rem 0.6rem', fontSize:'0.72rem'}}>
          Cancel
        </button>
      </div>
    );
    if (status === 'received') return (
      <button onClick={() => router.push('/notifications')} className="btn-primary"
        style={{width:'100%', padding:'0.45rem', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.35rem'}}>
        <UserCheck size={13}/> Respond
      </button>
    );
    return (
      <button onClick={() => sendRequest(u.id)} disabled={sendingTo === u.id} className="btn-primary"
        style={{width:'100%', padding:'0.45rem', fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.35rem'}}>
        <UserPlus size={13}/> {sendingTo === u.id ? '...' : 'Connect'}
      </button>
    );
  };

  const UserCard = ({ u }) => (
    <div className="glass-card" style={{padding:'1rem'}}>
      <div style={{display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.65rem'}}>
        <Link href={`/users/${u.id}`} style={{flexShrink:0}}>
          <Avatar user={u} size={44} radius="12px"/>
        </Link>
        <div style={{flex:1, minWidth:0}}>
          <Link href={`/users/${u.id}`} style={{fontWeight:600, color:'white', fontSize:'0.875rem', textDecoration:'none', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {u.name}
          </Link>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>{u.department} • Batch {u.batch}</p>
          <span className={u.role === 'senior' ? 'badge-senior' : 'badge-junior'} style={{marginTop:'0.15rem', display:'inline-block'}}>{u.role}</span>
        </div>
      </div>
      {u.bio && <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.75rem', marginBottom:'0.5rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>{u.bio}</p>}
      {u.skills && <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.7rem', marginBottom:'0.65rem'}}>🛠️ {u.skills}</p>}
      <ConnectBtn u={u}/>
    </div>
  );

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  const tabs = [
    { key:'all', label:'All Members', icon:<Users size={14}/>, count: filteredUsers.length },
    { key:'requests', label:'Requests', icon:<Bell size={14}/>, count: requests.length },
    { key:'suggestions', label:'Suggestions', icon:<UserPlus size={14}/>, count: suggestions.length },
    { key:'connected', label:'Connected', icon:<Link2 size={14}/>, count: connectedList.length },
  ];

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>
        <h2 className="heading-text" style={{fontSize:'1.25rem', marginBottom:'1rem'}}>Find Members</h2>

        {/* Tabs */}
        <div style={{display:'flex', gap:'0.35rem', marginBottom:'1rem', flexWrap:'wrap', borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:'0.5rem'}}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display:'flex', alignItems:'center', gap:'0.35rem',
              background: tab === t.key ? 'rgba(34,197,94,0.12)' : 'transparent',
              border:'none', cursor:'pointer', padding:'0.4rem 0.875rem', borderRadius:'8px',
              fontSize:'0.82rem', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? '#22c55e' : 'rgba(255,255,255,0.45)',
              transition:'all 0.2s'
            }}>
              {t.icon} {t.label}
              {t.count > 0 && (
                <span style={{
                  background: tab === t.key ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)',
                  color: tab === t.key ? '#22c55e' : 'rgba(255,255,255,0.4)',
                  borderRadius:'999px', padding:'0 6px', fontSize:'0.7rem', fontWeight:700
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter — only for All/Suggestions/Connected */}
        {tab !== 'requests' && (
          <div className="post-card" style={{display:'flex', flexWrap:'wrap', gap:'0.6rem', marginBottom:'1rem'}}>
            <div style={{position:'relative', flex:1, minWidth:'160px'}}>
              <Search size={13} style={{position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)'}}/>
              <input type="text" placeholder="Search by name..." value={search}
                onChange={e => setSearch(e.target.value)} className="input-field" style={{paddingLeft:'2rem'}}/>
            </div>
            <input type="text" placeholder="Department" value={department}
              onChange={e => setDepartment(e.target.value)} className="input-field" style={{width:'130px'}}/>
            <select value={role} onChange={e => setRole(e.target.value)} className="input-field" style={{width:'120px'}}>
              <option value="">All Roles</option>
              <option value="senior">Senior</option>
              <option value="junior">Junior</option>
            </select>
          </div>
        )}

        {/* Tab: All Members */}
        {tab === 'all' && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'0.65rem'}}>
            {filteredUsers.length === 0 ? (
              <p style={{color:'rgba(255,255,255,0.25)', gridColumn:'1/-1', textAlign:'center', padding:'2rem'}}>No members found.</p>
            ) : filteredUsers.map(u => <UserCard key={u.id} u={u}/>)}
          </div>
        )}

        {/* Tab: Connection Requests */}
        {tab === 'requests' && (
          <div style={{display:'flex', flexDirection:'column', gap:'0.65rem'}}>
            {requests.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <Bell size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)'}}>No pending connection requests</p>
              </div>
            ) : requests.map(req => (
              <div key={req.id} className="feed-card" style={{display:'flex', alignItems:'center', gap:'0.875rem'}}>
                <Link href={`/users/${req.sender?.id}`} style={{flexShrink:0}}>
                  <Avatar user={req.sender} size={48} radius="12px"/>
                </Link>
                <div style={{flex:1, minWidth:0}}>
                  <Link href={`/users/${req.sender?.id}`} style={{fontWeight:700, color:'white', fontSize:'0.9rem', textDecoration:'none'}}>
                    {req.sender?.name}
                  </Link>
                  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>{req.sender?.department} • Batch {req.sender?.batch}</p>
                  <span className={req.sender?.role === 'senior' ? 'badge-senior' : 'badge-junior'} style={{marginTop:'0.2rem', display:'inline-block'}}>{req.sender?.role}</span>
                  {req.sender?.bio && <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.75rem', marginTop:'0.25rem', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical'}}>{req.sender.bio}</p>}
                </div>
                <div style={{display:'flex', gap:'0.4rem', flexShrink:0}}>
                  <button onClick={() => acceptRequest(req.id, req.senderId)} className="btn-primary"
                    style={{padding:'0.4rem 0.875rem', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                    <UserCheck size={14}/> Accept
                  </button>
                  <button onClick={() => declineRequest(req.id, req.senderId)} className="btn-danger"
                    style={{padding:'0.4rem 0.875rem', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
                    <UserX size={14}/> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Suggestions */}
        {tab === 'suggestions' && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'0.65rem'}}>
            {suggestions.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem', gridColumn:'1/-1'}}>
                <UserPlus size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)'}}>No suggestions found</p>
              </div>
            ) : suggestions.map(u => <UserCard key={u.id} u={u}/>)}
          </div>
        )}

        {/* Tab: Connected With */}
        {tab === 'connected' && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'0.65rem'}}>
            {connectedList.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem', gridColumn:'1/-1'}}>
                <Link2 size={40} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'0.5rem'}}>No connections yet</p>
                <button onClick={() => setTab('suggestions')} className="btn-primary" style={{padding:'0.5rem 1.25rem', fontSize:'0.85rem'}}>
                  Find People to Connect
                </button>
              </div>
            ) : connectedList.map(u => <UserCard key={u.id} u={u}/>)}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}