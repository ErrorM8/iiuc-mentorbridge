'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Droplets, Plus, X, Search, MessageSquare, Check, Trash2, MapPin, Calendar, AlertTriangle, Heart, Edit, Filter, Send } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Avatar from '../components/Avatar';
import Link from 'next/link';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bgColor = (bg) => {
  const map = { 'A+':'#ef4444','A-':'#f97316','B+':'#22c55e','B-':'#10b981','AB+':'#8b5cf6','AB-':'#a78bfa','O+':'#3b82f6','O-':'#60a5fa' };
  return map[bg] || '#22c55e';
};

const BGBadge = ({ bg, size = 'normal' }) => (
  <div style={{
    background:`${bgColor(bg)}22`, border:`1.5px solid ${bgColor(bg)}`,
    borderRadius: size === 'large' ? '12px' : '8px',
    padding: size === 'large' ? '0.5rem 1rem' : '0.2rem 0.6rem',
    display:'inline-flex', alignItems:'center', gap:'0.2rem', flexShrink:0
  }}>
    <Droplets size={size === 'large' ? 16 : 11} color={bgColor(bg)}/>
    <span style={{color:bgColor(bg), fontWeight:800, fontSize: size === 'large' ? '1.1rem' : '0.78rem'}}>{bg}</span>
  </div>
);

const formatWhatsApp = (number) => {
  let n = number.replace(/\D/g, '');
  if (n.startsWith('0')) n = '880' + n.slice(1);
  if (!n.startsWith('880') && n.length === 10) n = '880' + n;
  return n;
};

function DirectMessageModal({ donor, token, onClose }) {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/send-direct`,
        { receiverId: donor.userId, content: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
      setTimeout(() => {
        onClose();
        router.push(`/messages?userId=${donor.userId}&userName=${encodeURIComponent(donor.user?.name)}`);
      }, 1200);
    } catch (err) { alert('Failed to send message'); } finally { setSending(false); }
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'1rem'}}>
      <div className="glass-card" style={{width:'100%', maxWidth:'420px', padding:'1.5rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'0.95rem'}}>Message Donor</h3>
          <button onClick={onClose} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
        </div>
        <Link href={`/users/${donor.userId}`} style={{textDecoration:'none'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.65rem', background:'rgba(255,255,255,0.04)', borderRadius:'10px', marginBottom:'1rem', cursor:'pointer', transition:'background 0.2s'}}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}>
            <Avatar user={donor.user} size={38} radius="10px"/>
            <div>
              <p style={{color:'white', fontWeight:600, fontSize:'0.875rem'}}>{donor.user?.name}</p>
              <BGBadge bg={donor.bloodGroup}/>
            </div>
          </div>
        </Link>
        {sent ? (
          <div style={{textAlign:'center', padding:'1rem', background:'rgba(34,197,94,0.08)', borderRadius:'10px', border:'1px solid rgba(34,197,94,0.2)'}}>
            <Check size={24} color="#22c55e" style={{margin:'0 auto 0.5rem', display:'block'}}/>
            <p style={{color:'#22c55e', fontWeight:600}}>Message Sent!</p>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', marginTop:'0.25rem'}}>Taking you to chat...</p>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{display:'flex', flexDirection:'column', gap:'0.65rem'}}>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} required
              className="input-field" rows={3} style={{resize:'none', fontSize:'0.85rem'}}
              placeholder={`Hi ${donor.user?.name}, I need ${donor.bloodGroup} blood...`} autoFocus/>
            <button type="submit" disabled={sending || !msg.trim()} className="btn-primary"
              style={{width:'100%', padding:'0.65rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
              <Send size={15}/> {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({ filterBG, onChange, onClose }) {
  return (
    <div style={{
      position:'absolute', top:'calc(100% + 6px)', left:0,
      background:'rgba(10,20,10,0.97)', backdropFilter:'blur(24px)',
      border:'1px solid rgba(34,197,94,0.2)', borderRadius:'12px',
      padding:'0.5rem', zIndex:50, boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
      minWidth:'200px'
    }}>
      <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.7rem', fontWeight:600, padding:'0.3rem 0.65rem', textTransform:'uppercase', letterSpacing:'0.04em'}}>Blood Group</p>
      <button onClick={() => { onChange('all'); onClose(); }} style={{
        display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.45rem 0.65rem',
        background: filterBG === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
        border:'none', borderRadius:'7px', color: filterBG === 'all' ? 'white' : 'rgba(255,255,255,0.6)',
        cursor:'pointer', width:'100%', fontSize:'0.82rem', fontWeight: filterBG === 'all' ? 600 : 400
      }}>🩸 All Blood Groups</button>
      {BLOOD_GROUPS.map(bg => (
        <button key={bg} onClick={() => { onChange(bg); onClose(); }} style={{
          display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.45rem 0.65rem',
          background: filterBG === bg ? `${bgColor(bg)}22` : 'transparent',
          border:'none', borderRadius:'7px',
          color: filterBG === bg ? bgColor(bg) : 'rgba(255,255,255,0.65)',
          cursor:'pointer', width:'100%', fontSize:'0.82rem', fontWeight: filterBG === bg ? 700 : 400,
          transition:'all 0.15s'
        }}>
          <Droplets size={13} color={bgColor(bg)}/> {bg}
        </button>
      ))}
    </div>
  );
}

export default function BloodBankPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBG, setFilterBG] = useState('all');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [myDonorProfile, setMyDonorProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [directMsgDonor, setDirectMsgDonor] = useState(null);
  const filterRef = useRef(null);

  const [requestForm, setRequestForm] = useState({
    bloodGroup:'A+', patientName:'', hospital:'', location:'', contact:'', details:'', urgent:false
  });
  const [donorForm, setDonorForm] = useState({
    location:'', whatsapp:'', lastDonationDate:'', available:true
  });

  const fetchRequests = useCallback(async (tkn, bg = 'all') => {
    try {
      const params = {};
      if (bg !== 'all') params.bloodGroup = bg;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blood/requests`, {
        headers: { Authorization: `Bearer ${tkn}` }, params
      });
      setRequests(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchDonors = useCallback(async (tkn, bg = 'all', loc = '') => {
    try {
      const params = {};
      if (bg !== 'all') params.bloodGroup = bg;
      if (loc) params.location = loc;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blood/donors`, {
        headers: { Authorization: `Bearer ${tkn}` }, params
      });
      setDonors(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchMyDonorProfile = useCallback(async (tkn) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blood/donors/me`, {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      setMyDonorProfile(res.data);
      if (res.data) {
        setDonorForm({
          location: res.data.location,
          whatsapp: res.data.whatsapp,
          lastDonationDate: res.data.lastDonationDate ? res.data.lastDonationDate.split('T')[0] : '',
          available: res.data.available
        });
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));
    Promise.all([fetchRequests(tkn), fetchDonors(tkn), fetchMyDonorProfile(tkn)]).finally(() => setLoading(false));
  }, [router, fetchRequests, fetchDonors, fetchMyDonorProfile]);

  useEffect(() => {
    const handleClick = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleBGFilter = (bg) => {
    setFilterBG(bg);
    if (tab === 'requests') fetchRequests(token, bg);
    else fetchDonors(token, bg, filterLocation);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/blood/requests`,
        requestForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add to top of active requests
      setRequests(prev => [res.data, ...prev]);
      setShowRequestForm(false);
      setRequestForm({ bloodGroup:'A+', patientName:'', hospital:'', location:'', contact:'', details:'', urgent:false });
      if (res.data.notifiedCount > 0) alert(`✅ Posted! ${res.data.notifiedCount} people notified.`);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); } finally { setSubmitting(false); }
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = { ...donorForm, bloodGroup: user?.bloodGroup || 'A+' };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/blood/donors`,
        submitData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyDonorProfile(res.data);
      setShowDonorForm(false);
      fetchDonors(token, filterBG, filterLocation);
    } catch (err) { alert(err.response?.data?.message || 'Failed'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blood/requests/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) { alert('Failed'); }
  };

  const handleFulfill = async (id) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/blood/requests/${id}/fulfill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update status locally — keep card, move to bottom
      setRequests(prev => {
        const updated = prev.map(r => r.id === id ? { ...r, status:'fulfilled' } : r);
        // Re-sort: active first, fulfilled at bottom
        return [
          ...updated.filter(r => r.status !== 'fulfilled'),
          ...updated.filter(r => r.status === 'fulfilled')
        ];
      });
    } catch (err) { alert('Failed'); }
  };

  // Active request count (not fulfilled)
  const activeCount = requests.filter(r => r.status !== 'fulfilled').length;

  if (loading) return (
    <div className="page-bg" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{color:'#22c55e', fontWeight:600}}>Loading...</p>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem'}}>
          <div>
            <h2 className="heading-text" style={{fontSize:'1.3rem', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.2rem'}}>
              <Droplets size={22} color="#ef4444"/> Blood Bank
            </h2>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem'}}>Request blood or register as a donor for IIUC community</p>
          </div>
          <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
            <button onClick={() => setShowRequestForm(true)} className="btn-danger"
              style={{padding:'0.5rem 1rem', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
              <Plus size={14}/> Need Blood
            </button>
            <button onClick={() => setShowDonorForm(true)} className="btn-primary"
              style={{padding:'0.5rem 1rem', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
              {myDonorProfile ? <><Edit size={14}/> Update Donor Info</> : <><Heart size={14}/> Become a Donor</>}
            </button>
          </div>
        </div>

        {/* Tabs — active count only */}
        <div style={{display:'flex', gap:'0.4rem', marginBottom:'1rem', borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:'0.5rem'}}>
          {[
            { key:'requests', label:'Blood Requests', count: activeCount, color:'#ef4444' },
            { key:'donors', label:'Donors', count: donors.length, color:'#22c55e' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab === t.key ? `${t.color}18` : 'transparent',
              border:'none', cursor:'pointer', padding:'0.4rem 0.875rem', borderRadius:'8px',
              fontSize:'0.82rem', fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? t.color : 'rgba(255,255,255,0.45)',
              display:'flex', alignItems:'center', gap:'0.4rem'
            }}>
              {t.label}
              <span style={{
                background: tab === t.key ? `${t.color}33` : 'rgba(255,255,255,0.08)',
                color: tab === t.key ? t.color : 'rgba(255,255,255,0.4)',
                borderRadius:'999px', padding:'0 6px', fontSize:'0.72rem', fontWeight:700
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap'}}>
          <div ref={filterRef} style={{position:'relative'}}>
            <button onClick={() => setShowFilter(!showFilter)} style={{
              display:'flex', alignItems:'center', gap:'0.4rem',
              padding:'0.45rem 0.875rem', borderRadius:'9px',
              background: filterBG !== 'all' ? `${bgColor(filterBG)}22` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${filterBG !== 'all' ? bgColor(filterBG) : 'rgba(255,255,255,0.15)'}`,
              color: filterBG !== 'all' ? bgColor(filterBG) : 'rgba(255,255,255,0.65)',
              cursor:'pointer', fontSize:'0.82rem', fontWeight:600, transition:'all 0.2s'
            }}>
              <Filter size={14}/>
              {filterBG === 'all' ? 'Filter' : filterBG}
              {filterBG !== 'all' && (
                <span onClick={e => { e.stopPropagation(); handleBGFilter('all'); }}
                  style={{marginLeft:'0.15rem', color:'rgba(255,255,255,0.5)', lineHeight:1, fontSize:'1rem'}}>×</span>
              )}
            </button>
            {showFilter && <FilterDropdown filterBG={filterBG} onChange={handleBGFilter} onClose={() => setShowFilter(false)}/>}
          </div>

          {tab === 'donors' && (
            <>
              <button onClick={() => setShowLocationSearch(!showLocationSearch)} style={{
                display:'flex', alignItems:'center', gap:'0.4rem',
                padding:'0.45rem 0.875rem', borderRadius:'9px',
                background: filterLocation ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filterLocation ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`,
                color: filterLocation ? '#22c55e' : 'rgba(255,255,255,0.65)',
                cursor:'pointer', fontSize:'0.82rem', fontWeight:500
              }}>
                <Search size={14}/>
                {filterLocation || 'Location'}
                {filterLocation && (
                  <span onClick={e => { e.stopPropagation(); setFilterLocation(''); fetchDonors(token, filterBG, ''); }}
                    style={{marginLeft:'0.15rem', color:'rgba(255,255,255,0.5)', fontSize:'1rem'}}>×</span>
                )}
              </button>
              {showLocationSearch && (
                <input type="text" placeholder="Type location..." value={filterLocation}
                  onChange={e => { setFilterLocation(e.target.value); fetchDonors(token, filterBG, e.target.value); }}
                  className="input-field" style={{fontSize:'0.8rem', maxWidth:'180px'}} autoFocus
                  onBlur={() => setTimeout(() => setShowLocationSearch(false), 150)}/>
              )}
            </>
          )}
        </div>

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
            {requests.length === 0 ? (
              <div style={{textAlign:'center', padding:'3rem'}}>
                <Droplets size={48} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'1rem'}}>
                  {filterBG !== 'all' ? `No ${filterBG} blood requests` : 'No blood requests right now'}
                </p>
                <button onClick={() => setShowRequestForm(true)} className="btn-danger" style={{padding:'0.5rem 1.25rem'}}>
                  Post a Request
                </button>
              </div>
            ) : requests.map(req => (
              <div key={req.id} className="feed-card" style={{
                border: req.status === 'fulfilled'
                  ? '1px solid rgba(34,197,94,0.2)'
                  : req.urgent ? '1px solid rgba(239,68,68,0.4)' : undefined,
                opacity: req.status === 'fulfilled' ? 0.75 : 1
              }}>
                {/* Status banners */}
                {req.status === 'fulfilled' && (
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.65rem', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', padding:'0.4rem 0.75rem'}}>
                    <Check size={14} color="#22c55e"/>
                    <span style={{color:'#22c55e', fontWeight:700, fontSize:'0.8rem'}}>✓ MANAGED — Blood Found Successfully</span>
                  </div>
                )}
                {req.urgent && req.status !== 'fulfilled' && (
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.65rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'0.4rem 0.75rem'}}>
                    <AlertTriangle size={14} color="#f87171"/>
                    <span style={{color:'#f87171', fontWeight:700, fontSize:'0.8rem'}}>URGENT REQUEST</span>
                  </div>
                )}

                <div style={{display:'flex', alignItems:'flex-start', gap:'0.875rem'}}>
                  <BGBadge bg={req.bloodGroup} size="large"/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.4rem'}}>
                      <div>
                        <p style={{color:'white', fontWeight:700, fontSize:'0.95rem'}}>{req.patientName}</p>
                        <div style={{display:'flex', flexDirection:'column', gap:'0.25rem', marginTop:'0.35rem'}}>
                          <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.8rem'}}>🏥 {req.hospital}</p>
                          <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.35rem'}}>
                            <MapPin size={12} color="#22c55e"/> {req.location}
                          </p>
                          <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.8rem'}}>📞 {req.contact}</p>
                        </div>
                        {req.details && (
                          <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.78rem', marginTop:'0.35rem', fontStyle:'italic'}}>"{req.details}"</p>
                        )}
                      </div>
                      <div style={{display:'flex', flexDirection:'column', gap:'0.4rem', alignItems:'flex-end'}}>
                        <Link href={`/users/${req.user?.id}`} style={{textDecoration:'none', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                          <span style={{color:'rgba(255,255,255,0.35)', fontSize:'0.7rem'}}>{req.user?.name}</span>
                          <Avatar user={req.user} size={22} radius="50%"/>
                        </Link>
                        <span style={{color:'rgba(255,255,255,0.2)', fontSize:'0.68rem'}}>{new Date(req.createdAt).toLocaleDateString()}</span>
                        {req.userId === user?.id && (
                          <div style={{display:'flex', gap:'0.35rem', flexWrap:'wrap', justifyContent:'flex-end'}}>
                            {req.status !== 'fulfilled' && (
                              <button onClick={() => handleFulfill(req.id)} className="btn-primary"
                                style={{padding:'0.3rem 0.65rem', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.2rem'}}>
                                <Check size={11}/> Mark Managed
                              </button>
                            )}
                            <button onClick={() => handleDelete(req.id)} className="btn-danger"
                              style={{padding:'0.3rem 0.6rem', fontSize:'0.72rem'}}>
                              <Trash2 size={11}/>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {req.userId !== user?.id && req.status !== 'fulfilled' && (
                      <button
                        onClick={() => router.push(`/messages?userId=${req.user?.id}&userName=${encodeURIComponent(req.user?.name)}`)}
                        className="btn-outline"
                        style={{marginTop:'0.65rem', padding:'0.4rem 0.875rem', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.35rem', width:'fit-content'}}>
                        <MessageSquare size={13}/> Contact Requester
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Divider between active and fulfilled */}
            {requests.some(r => r.status === 'fulfilled') && requests.some(r => r.status !== 'fulfilled') && (
              <div style={{display:'flex', alignItems:'center', gap:'0.75rem', margin:'0.25rem 0'}}>
                <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.07)'}}/>
                <span style={{color:'rgba(255,255,255,0.25)', fontSize:'0.72rem'}}>Managed Requests</span>
                <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.07)'}}/>
              </div>
            )}
          </div>
        )}

        {/* Donors Tab */}
        {tab === 'donors' && (
          <>
            {myDonorProfile && (
              <div className="feed-card" style={{marginBottom:'0.75rem', border:'1px solid rgba(34,197,94,0.25)', background:'rgba(34,197,94,0.05)'}}>
                <p style={{color:'#22c55e', fontWeight:700, fontSize:'0.82rem', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                  <Heart size={14}/> Your Donor Profile
                </p>
                <div style={{display:'flex', alignItems:'center', gap:'0.875rem', flexWrap:'wrap'}}>
                  <BGBadge bg={myDonorProfile.bloodGroup} size="large"/>
                  <div style={{flex:1}}>
                    <p style={{color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.35rem'}}>
                      <MapPin size={12} color="#22c55e"/> {myDonorProfile.location}
                    </p>
                    {myDonorProfile.lastDonationDate && (
                      <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.35rem', marginTop:'0.2rem'}}>
                        <Calendar size={12} color="#22c55e"/> Last donated: {new Date(myDonorProfile.lastDonationDate).toLocaleDateString()}
                      </p>
                    )}
                    <span style={{
                      background: myDonorProfile.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${myDonorProfile.available ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      color: myDonorProfile.available ? '#22c55e' : '#f87171',
                      padding:'1px 8px', borderRadius:'999px', fontSize:'0.7rem', fontWeight:600,
                      display:'inline-block', marginTop:'0.25rem'
                    }}>
                      {myDonorProfile.available ? '● Available' : '● Not Available'}
                    </span>
                  </div>
                  <button onClick={() => setShowDonorForm(true)} className="btn-outline"
                    style={{padding:'0.4rem 0.875rem', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.35rem', flexShrink:0}}>
                    <Edit size={13}/> Update
                  </button>
                </div>
              </div>
            )}

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'0.75rem'}}>
              {donors.length === 0 ? (
                <div style={{textAlign:'center', padding:'3rem', gridColumn:'1/-1'}}>
                  <Heart size={48} style={{color:'rgba(255,255,255,0.1)', margin:'0 auto 0.75rem', display:'block'}}/>
                  <p style={{color:'rgba(255,255,255,0.3)', marginBottom:'1rem'}}>
                    {filterBG !== 'all' ? `No ${filterBG} donors found` : 'No donors registered yet'}
                  </p>
                  <button onClick={() => setShowDonorForm(true)} className="btn-primary" style={{padding:'0.5rem 1.25rem'}}>
                    {myDonorProfile ? 'Update Your Profile' : 'Be the first donor!'}
                  </button>
                </div>
              ) : donors.map(donor => (
                <div key={donor.id} className="glass-card" style={{padding:'1rem', display:'flex', flexDirection:'column', gap:'0.65rem'}}>
                  <Link href={`/users/${donor.userId}`} style={{textDecoration:'none', display:'flex', alignItems:'center', gap:'0.65rem'}}>
                    <Avatar user={donor.user} size={42} radius="12px"/>
                    <div style={{flex:1, minWidth:0}}>
                      <p style={{color:'white', fontWeight:600, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.2s'}}
                        onMouseEnter={e => e.currentTarget.style.color='#22c55e'}
                        onMouseLeave={e => e.currentTarget.style.color='white'}>
                        {donor.user?.name}
                      </p>
                      <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>{donor.user?.department} • Batch {donor.user?.batch}</p>
                    </div>
                    <BGBadge bg={donor.bloodGroup}/>
                  </Link>

                  <div style={{display:'flex', flexDirection:'column', gap:'0.3rem'}}>
                    <p style={{color:'rgba(255,255,255,0.55)', fontSize:'0.78rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                      <MapPin size={12} color="#22c55e"/> {donor.location}
                    </p>
                    {donor.lastDonationDate && (
                      <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                        <Calendar size={12} color="#22c55e"/> Last: {new Date(donor.lastDonationDate).toLocaleDateString()}
                      </p>
                    )}
                    <span style={{
                      background: donor.available ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${donor.available ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      color: donor.available ? '#22c55e' : '#f87171',
                      padding:'1px 8px', borderRadius:'999px', fontSize:'0.7rem', fontWeight:600,
                      display:'inline-block', width:'fit-content'
                    }}>
                      {donor.available ? '● Available' : '● Not Available Now'}
                    </span>
                  </div>

                  {donor.userId !== user?.id ? (
                    <div style={{display:'flex', gap:'0.4rem'}}>
                      <button onClick={() => window.open(`https://wa.me/${formatWhatsApp(donor.whatsapp)}?text=${encodeURIComponent(`Hi ${donor.user?.name}, I need ${donor.bloodGroup} blood. Can you help?`)}`, '_blank')}
                        style={{
                          flex:1, padding:'0.5rem', borderRadius:'9px', border:'none', cursor:'pointer',
                          background:'linear-gradient(135deg,#25d366,#128c7e)',
                          color:'white', fontWeight:600, fontSize:'0.78rem',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:'0.35rem',
                          transition:'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                        💬 WhatsApp
                      </button>
                      <button onClick={() => setDirectMsgDonor(donor)}
                        style={{
                          flex:1, padding:'0.5rem', borderRadius:'9px', cursor:'pointer',
                          background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)',
                          color:'#22c55e', fontWeight:600, fontSize:'0.78rem',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:'0.35rem',
                          transition:'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(34,197,94,0.1)'}>
                        <MessageSquare size={13}/> Message
                      </button>
                    </div>
                  ) : (
                    <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.72rem', textAlign:'center'}}>This is your profile</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Blood Request Form Modal */}
      {showRequestForm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:'500px', padding:'1.5rem', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{color:'#ef4444', fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <Droplets size={16}/> Blood Request
              </h3>
              <button onClick={() => setShowRequestForm(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
            </div>
            <form onSubmit={handleRequestSubmit} style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem'}}>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Blood Group *</label>
                  <select value={requestForm.bloodGroup} onChange={e => setRequestForm(p => ({...p, bloodGroup:e.target.value}))} className="input-field">
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Patient Name *</label>
                  <input type="text" value={requestForm.patientName} onChange={e => setRequestForm(p => ({...p, patientName:e.target.value}))} required className="input-field" placeholder="Patient's name"/>
                </div>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Hospital *</label>
                <input type="text" value={requestForm.hospital} onChange={e => setRequestForm(p => ({...p, hospital:e.target.value}))} required className="input-field" placeholder="Hospital name"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Location *</label>
                <input type="text" value={requestForm.location} onChange={e => setRequestForm(p => ({...p, location:e.target.value}))} required className="input-field" placeholder="e.g. Chittagong"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Contact Number *</label>
                <input type="text" value={requestForm.contact} onChange={e => setRequestForm(p => ({...p, contact:e.target.value}))} required className="input-field" placeholder="Phone number"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Additional Details</label>
                <textarea value={requestForm.details} onChange={e => setRequestForm(p => ({...p, details:e.target.value}))} className="input-field" rows={2} style={{resize:'none'}} placeholder="e.g. Needed within 24 hours..."/>
              </div>
              <label style={{display:'flex', alignItems:'center', gap:'0.65rem', cursor:'pointer', padding:'0.65rem', background:'rgba(239,68,68,0.05)', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.15)'}}>
                <div onClick={() => setRequestForm(p => ({...p, urgent:!p.urgent}))}
                  style={{width:'20px', height:'20px', borderRadius:'5px', border:`2px solid ${requestForm.urgent ? '#ef4444' : 'rgba(255,255,255,0.25)'}`, background: requestForm.urgent ? '#ef4444' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s'}}>
                  {requestForm.urgent && <Check size={12} color="white"/>}
                </div>
                <span style={{color:'rgba(255,255,255,0.7)', fontSize:'0.82rem'}}>
                  <span style={{color:'#f87171', fontWeight:600}}>⚠️ Mark as Urgent</span>
                </span>
              </label>
              <div style={{padding:'0.65rem', background:'rgba(34,197,94,0.05)', borderRadius:'8px', border:'1px solid rgba(34,197,94,0.15)'}}>
                <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.75rem'}}>
                  🔔 All IIUCians with <strong style={{color:'#22c55e'}}>{requestForm.bloodGroup}</strong> blood group will be notified
                </p>
              </div>
              <button type="submit" disabled={submitting} className="btn-danger"
                style={{width:'100%', padding:'0.65rem', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
                <Droplets size={16}/> {submitting ? 'Posting...' : 'Post Blood Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Donor Form Modal */}
      {showDonorForm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'1rem'}}>
          <div className="glass-card" style={{width:'100%', maxWidth:'460px', padding:'1.5rem', maxHeight:'90vh', overflowY:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'1rem', display:'flex', alignItems:'center', gap:'0.4rem'}}>
                <Heart size={16}/> {myDonorProfile ? 'Update Donor Profile' : 'Register as Donor'}
              </h3>
              <button onClick={() => setShowDonorForm(false)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer'}}><X size={18}/></button>
            </div>
            <form onSubmit={handleDonorSubmit} style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>

              {/* Blood Group — read only from profile */}
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>
                  Blood Group <span style={{color:'rgba(255,255,255,0.3)', fontWeight:400}}>(from your profile)</span>
                </label>
                {user?.bloodGroup ? (
                  <div style={{
                    display:'flex', alignItems:'center', gap:'0.75rem',
                    padding:'0.6rem 0.875rem', background:'rgba(255,255,255,0.03)',
                    border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px',
                    cursor:'default'
                  }}>
                    <BGBadge bg={user.bloodGroup} size="large"/>
                    <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.75rem'}}>
                      🔒 To change, update your profile settings
                    </span>
                  </div>
                ) : (
                  <div style={{padding:'0.65rem', background:'rgba(239,68,68,0.06)', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.2)'}}>
                    <p style={{color:'#f87171', fontSize:'0.82rem'}}>
                      ⚠️ No blood group in your profile.{' '}
                      <span onClick={() => { setShowDonorForm(false); router.push('/profile'); }}
                        style={{color:'#22c55e', cursor:'pointer', textDecoration:'underline'}}>
                        Update profile →
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Location *</label>
                <input type="text" value={donorForm.location} onChange={e => setDonorForm(p => ({...p, location:e.target.value}))} required className="input-field" placeholder="e.g. Chittagong, Dhaka"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>WhatsApp Number *</label>
                <input type="text" value={donorForm.whatsapp} onChange={e => setDonorForm(p => ({...p, whatsapp:e.target.value}))} required className="input-field" placeholder="e.g. 01XXXXXXXXX"/>
                <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.2rem'}}>🔒 Hidden from public. WhatsApp button redirects to your inbox directly.</p>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.3rem'}}>Last Donation Date</label>
                <input type="date" value={donorForm.lastDonationDate} onChange={e => setDonorForm(p => ({...p, lastDonationDate:e.target.value}))} className="input-field"/>
                <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.2rem'}}>Update this after every donation</p>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', display:'block', marginBottom:'0.4rem'}}>Availability *</label>
                <div style={{display:'flex', gap:'0.5rem'}}>
                  {[{val:true, label:'✅ Available', color:'#22c55e'}, {val:false, label:'❌ Not Available', color:'#ef4444'}].map(opt => (
                    <button key={String(opt.val)} type="button" onClick={() => setDonorForm(p => ({...p, available:opt.val}))}
                      style={{
                        flex:1, padding:'0.5rem', borderRadius:'9px', cursor:'pointer', fontSize:'0.8rem', fontWeight:600,
                        background: donorForm.available === opt.val ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${donorForm.available === opt.val ? opt.color + '55' : 'rgba(255,255,255,0.1)'}`,
                        color: donorForm.available === opt.val ? opt.color : 'rgba(255,255,255,0.5)',
                        transition:'all 0.2s'
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={submitting || !user?.bloodGroup} className="btn-primary"
                style={{width:'100%', padding:'0.65rem', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
                <Heart size={16}/> {submitting ? 'Saving...' : myDonorProfile ? 'Update Profile' : 'Register as Donor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {directMsgDonor && (
        <DirectMessageModal donor={directMsgDonor} token={token} onClose={() => setDirectMsgDonor(null)}/>
      )}

      <Footer/>
    </div>
  );
}