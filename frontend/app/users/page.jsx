'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [user, setUser] = useState(null);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [sendingTo, setSendingTo] = useState(null);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (userData) setUser(JSON.parse(userData));
    try {
      const params = {};
      if (department) params.department = department;
      if (role) params.role = role;
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );
      setUsers(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [router, department, role]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const sendRequest = async (receiverId) => {
    const token = localStorage.getItem('token');
    setSendingTo(receiverId);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/connections/send`, { receiverId }, { headers: { Authorization: `Bearer ${token}` } });
      setConnectionStatuses(prev => ({ ...prev, [receiverId]: { status: 'sent', connectionId: res.data.connection.id } }));
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally { setSendingTo(null); }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) &&
    u.id !== user?.id
  );

  const ConnectBtn = ({ userId }) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    setSending(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/connections/send`,
        { receiverId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally { setSending(false); }
  };

  if (sent) return (
    <button disabled className="btn-outline" style={{width:'100%', padding:'0.45rem', fontSize:'0.8rem', opacity:0.7}}>
      <UserCheck size={13}/> Request Sent
    </button>
  );

  return (
    <button onClick={handleSend} disabled={sending} className="btn-primary" style={{width:'100%', padding:'0.45rem', fontSize:'0.8rem'}}>
      <UserPlus size={13}/> {sending ? '...' : 'Connect'}
    </button>
  );
};

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>
        <h2 className="heading-text" style={{fontSize:'1.25rem', marginBottom:'1rem'}}>Find Members</h2>

        <div className="post-card" style={{display:'flex', flexWrap:'wrap', gap:'0.6rem', marginBottom:'1rem'}}>
          <div style={{position:'relative', flex:1, minWidth:'160px'}}>
            <Search size={13} style={{position:'absolute', left:'0.75rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)'}}/>
            <input type="text" placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" style={{paddingLeft:'2rem'}}/>
          </div>
          <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field" style={{width:'130px'}}/>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field" style={{width:'120px'}}>
            <option value="">All Roles</option>
            <option value="senior">Senior</option>
            <option value="junior">Junior</option>
          </select>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'0.65rem'}}>
          {filteredUsers.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.25)', gridColumn:'1/-1', textAlign:'center', padding:'2rem'}}>No members found.</p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="glass-card" style={{padding:'1rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.65rem'}}>
                  <div className="avatar" style={{width:'42px', height:'42px', fontSize:'1rem', borderRadius:'12px'}}>
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
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
                <ConnectBtn userId={u.id}/>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}