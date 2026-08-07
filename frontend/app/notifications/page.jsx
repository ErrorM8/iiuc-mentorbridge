'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Bell, UserCheck, UserX, CheckCheck, Check, Heart, ShoppingBag, Droplets } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function NotificationsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [actionDone, setActionDone] = useState({});
  const [token, setToken] = useState('');

  const fetchAll = useCallback(async () => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
    try {
      const [reqRes, notifRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/connections/requests`, { headers: { Authorization: `Bearer ${tkn}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { headers: { Authorization: `Bearer ${tkn}` } })
      ]);
      setRequests(reqRes.data);
      setNotifications(notifRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAction = async (connectionId, status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/connections/${connectionId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionDone(prev => ({ ...prev, [connectionId]: status }));
      const notifRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(notifRes.data);
    } catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) markRead(notif.id);
    if (notif.type === 'connection_accepted' || notif.type === 'connection_request') {
      if (notif.sender?.id) router.push(`/users/${notif.sender.id}`);
    }
    if (notif.type === 'buy_request') {
      router.push('/market');
    }
    if (notif.type === 'blood_request') {
      router.push('/blood');
    }
  };

  const pendingCount = requests.filter(r => !actionDone[r.id]).length;
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const totalUnread = pendingCount + unreadNotifCount;

  const getNotifStyle = (type) => {
    if (type === 'connection_request') return { color:'#22c55e', icon:UserCheck };
    if (type === 'connection_accepted') return { color:'#60a5fa', icon:UserCheck };
    if (type === 'like') return { color:'#f87171', icon:Heart };
    if (type === 'buy_request') return { color:'#f59e0b', icon:ShoppingBag };
    if (type === 'blood_request') return { color:'#ef4444', icon:Droplets };
    return { color:'#a78bfa', icon:Bell };
  };

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
            <h2 className="heading-text" style={{fontSize:'1.2rem'}}>Notifications</h2>
            {totalUnread > 0 && (
              <span style={{background:'rgba(34,197,94,0.15)', color:'#22c55e', border:'1px solid rgba(34,197,94,0.3)', padding:'1px 8px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700}}>
                {totalUnread} new
              </span>
            )}
          </div>
          {unreadNotifCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost" style={{fontSize:'0.75rem'}}>
              <CheckCheck size={13}/> Mark all read
            </button>
          )}
        </div>

        {/* Connection Requests */}
        {requests.length > 0 && (
          <div style={{marginBottom:'1rem'}}>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem'}}>
              Connection Requests ({pendingCount})
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {requests.map((req) => {
                const done = actionDone[req.id];
                return (
                  <div key={req.id} className="feed-card"
                    style={{display:'flex', alignItems:'center', gap:'0.75rem', opacity: done ? 0.6 : 1, cursor:'pointer'}}
                    onClick={() => !done && router.push(`/users/${req.sender?.id}`)}>
                    <Avatar user={req.sender} size={40} radius="10px"/>
                    <div style={{flex:1, minWidth:0}}>
                      <p style={{color:'rgba(255,255,255,0.88)', fontSize:'0.85rem', fontWeight:600}}>{req.sender?.name}</p>
                      <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>{req.sender?.department} • Batch {req.sender?.batch}</p>
                      <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.1rem'}}>Sent you a connection request</p>
                    </div>
                    {!done ? (
                      <div style={{display:'flex', gap:'0.4rem', flexShrink:0}} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAction(req.id, 'accepted')} className="btn-primary" style={{padding:'0.35rem 0.7rem', fontSize:'0.78rem'}}>
                          <UserCheck size={13}/> Accept
                        </button>
                        <button onClick={() => handleAction(req.id, 'rejected')} className="btn-danger" style={{padding:'0.35rem 0.7rem', fontSize:'0.78rem'}}>
                          <UserX size={13}/> Decline
                        </button>
                      </div>
                    ) : (
                      <span style={{color: done === 'accepted' ? '#22c55e' : '#f87171', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.3rem', flexShrink:0}}>
                        {done === 'accepted' ? <><CheckCheck size={13}/> Accepted</> : <><UserX size={13}/> Declined</>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Notifications */}
        {notifications.length > 0 && (
          <div>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem'}}>
              Activity
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
              {notifications.map((notif) => {
                const { color, icon: Icon } = getNotifStyle(notif.type);
                return (
                  <div key={notif.id} className="feed-card"
                    style={{display:'flex', alignItems:'center', gap:'0.75rem', opacity: notif.read ? 0.6 : 1, cursor:'pointer', transition:'opacity 0.2s'}}
                    onClick={() => handleNotifClick(notif)}>
                    <div style={{position:'relative', flexShrink:0}}>
                      <Avatar user={notif.sender} size={38} radius="10px"/>
                      <div style={{position:'absolute', bottom:'-3px', right:'-3px', width:'16px', height:'16px', borderRadius:'50%', background:`${color}22`, border:`1px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Icon size={9} color={color}/>
                      </div>
                    </div>
                    <div style={{flex:1, minWidth:0}}>
                      <p style={{color: notif.read ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.88)', fontSize:'0.82rem', lineHeight:'1.45'}}>
                        {notif.message}
                      </p>
                      <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.15rem'}}>
                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      </p>
                      {notif.type === 'blood_request' && (
                        <span style={{color:'#ef4444', fontSize:'0.7rem', display:'flex', alignItems:'center', gap:'0.2rem', marginTop:'0.15rem'}}>
                          <Droplets size={10}/> Click to view blood request
                        </span>
                      )}
                      {notif.type === 'buy_request' && (
                        <span style={{color:'#f59e0b', fontSize:'0.7rem', display:'flex', alignItems:'center', gap:'0.2rem', marginTop:'0.15rem'}}>
                          <ShoppingBag size={10}/> Click to view in Market
                        </span>
                      )}
                    </div>
                    {!notif.read && <div style={{width:'7px', height:'7px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}/>}
                    {notif.read && <Check size={13} color="rgba(255,255,255,0.2)" style={{flexShrink:0}}/>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty */}
        {requests.length === 0 && notifications.length === 0 && (
          <div style={{textAlign:'center', padding:'3rem 1rem'}}>
            <Bell size={40} style={{margin:'0 auto 0.75rem', display:'block', color:'rgba(255,255,255,0.15)'}}/>
            <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.875rem'}}>No notifications yet</p>
            <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.78rem', marginTop:'0.25rem'}}>Connection requests and activity will appear here</p>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}