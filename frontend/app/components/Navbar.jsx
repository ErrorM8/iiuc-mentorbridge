'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Users, Bell, Settings, Info, FileText, Bus, LogOut, ChevronDown, Menu, X, Globe, MessageSquare, BookOpen, User } from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import axios from 'axios';

export default function Navbar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const moreRef = useRef(null);
  const menuRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifCount(prev => prev !== res.data.count ? res.data.count : prev);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to { opacity:1; transform:translateY(0); }
        }
        .mobile-dropdown {
          animation: slideDown 0.2s ease forwards;
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: rgba(10,20,10,0.97);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 12px;
          padding: 0.35rem;
          min-width: 180px;
          max-height: 65vh;
          overflow-y: auto;
          z-index: 200;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .mobile-dropdown::-webkit-scrollbar { width: 3px; }
        .mobile-dropdown::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 999px; }
        .mob-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.42rem 0.65rem;
          border-radius: 7px;
          color: rgba(255,255,255,0.7);
          font-size: 0.78rem;
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .mob-item:hover { background: rgba(34,197,94,0.1); color: #22c55e; }
        .mob-item-danger { color: rgba(239,68,68,0.7) !important; }
        .mob-item-danger:hover { background: rgba(239,68,68,0.1) !important; color: #f87171 !important; }
        .mob-divider { height: 1px; background: rgba(34,197,94,0.12); margin: 0.25rem 0; }
        @media (min-width: 769px) { .show-mobile { display: none !important; } .hidden-mobile { display: flex !important; } }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
      `}</style>

      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(15,25,13,0.95)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(34,197,94,0.12)',
      }}>
        <div style={{maxWidth:'1200px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 1.5rem'}}>

          {/* Logo */}
          <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', flexShrink:0}}>
            <Logo size={30}/>
            <div style={{lineHeight:1.1}}>
              <div style={{fontSize:'0.88rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
              <div style={{fontSize:'0.58rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.04em'}}>MentorBridge</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden-mobile" style={{alignItems:'center', gap:'0.25rem'}}>
            {[
              { href:'/messages', icon:<MessageSquare size={14}/>, label:'Messages' },
              { href:'/resources', icon:<BookOpen size={14}/>, label:'Resources' },
              { href:'/chat', icon:<Bot size={14}/>, label:'AI Mentor' },
              { href:'/users', icon:<Users size={14}/>, label:'Members' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.4rem 0.7rem', borderRadius:'8px', color:'rgba(255,255,255,0.65)', fontSize:'0.8rem', textDecoration:'none', transition:'all 0.2s', whiteSpace:'nowrap'}}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.1)'; e.currentTarget.style.color='#22c55e'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}>
                {item.icon} {item.label}
              </Link>
            ))}

            {/* Notifications */}
            <Link href="/notifications" onClick={() => setNotifCount(0)}
              style={{display:'flex', alignItems:'center', padding:'0.4rem 0.6rem', borderRadius:'8px', color:'rgba(255,255,255,0.65)', textDecoration:'none', position:'relative', transition:'all 0.2s'}}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.1)'; e.currentTarget.style.color='#22c55e'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; }}>
              <Bell size={15}/>
              {notifCount > 0 && (
                <span style={{position:'absolute', top:'-2px', right:'-2px', background:'#22c55e', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {notifCount}
                </span>
              )}
            </Link>

            {/* More Dropdown */}
            <div ref={moreRef} style={{position:'relative'}}>
              <button onClick={() => setMoreOpen(!moreOpen)}
                style={{display:'flex', alignItems:'center', gap:'0.3rem', padding:'0.4rem 0.7rem', borderRadius:'8px', color:'rgba(255,255,255,0.65)', fontSize:'0.8rem', background:'transparent', border:'none', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap'}}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.1)'; e.currentTarget.style.color='#22c55e'; }}
                onMouseLeave={e => { if(!moreOpen){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.65)'; } }}>
                <Menu size={14}/> More <ChevronDown size={11} style={{transition:'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : 'none'}}/>
              </button>
              {moreOpen && (
                <div className="dropdown-menu" style={{position:'absolute', right:0, top:'calc(100% + 8px)', zIndex:50, minWidth:'190px'}}>
                  <Link href="/profile" className="dropdown-item" onClick={() => setMoreOpen(false)}><User size={14}/> Profile</Link>
                  <Link href="/about" className="dropdown-item" onClick={() => setMoreOpen(false)}><Info size={14}/> About Us</Link>
                  <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}><Globe size={14}/> Contact Us</a>
                  <Link href="/settings" className="dropdown-item" onClick={() => setMoreOpen(false)}><Settings size={14}/> Settings</Link>
                  <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}><FileText size={14}/> Cover Page</a>
                  <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}><Bus size={14}/> Transport</a>
                  <div className="dropdown-divider"/>
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}><LogOut size={14}/> Logout</button>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div style={{marginLeft:'0.25rem'}}>
              <Avatar user={user} size={30} radius="50%" onClick={() => router.push('/profile')}/>
            </div>
          </div>

          {/* Mobile Right */}
          <div className="show-mobile" style={{alignItems:'center', gap:'0.5rem'}}>
            <Link href="/notifications" onClick={() => setNotifCount(0)} style={{position:'relative', color:'rgba(255,255,255,0.65)', display:'flex'}}>
              <Bell size={18}/>
              {notifCount > 0 && (
                <span style={{position:'absolute', top:'-4px', right:'-4px', background:'#22c55e', color:'white', borderRadius:'50%', width:'15px', height:'15px', fontSize:'0.58rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {notifCount}
                </span>
              )}
            </Link>
            <Avatar user={user} size={28} radius="50%" onClick={() => router.push('/profile')}/>

            {/* Hamburger + Compact Dropdown */}
            <div ref={menuRef} style={{position:'relative'}}>
              <button onClick={() => setMenuOpen(!menuOpen)}
                style={{background:'transparent', border:'none', color:'#22c55e', cursor:'pointer', padding:'0.2rem', display:'flex', alignItems:'center'}}>
                {menuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>

              {menuOpen && (
                <div className="mobile-dropdown">
                  {/* User info */}
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.65rem 0.5rem', borderBottom:'1px solid rgba(34,197,94,0.12)', marginBottom:'0.25rem'}}>
                    <Avatar user={user} size={28} radius="7px"/>
                    <div>
                      <p style={{color:'white', fontWeight:600, fontSize:'0.75rem', lineHeight:1.2}}>{user?.name || 'User'}</p>
                      <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.62rem'}}>{user?.role} • {user?.department}</p>
                    </div>
                  </div>

                  <Link href="/messages" className="mob-item" onClick={() => setMenuOpen(false)}><MessageSquare size={13}/> Messages</Link>
                  <Link href="/resources" className="mob-item" onClick={() => setMenuOpen(false)}><BookOpen size={13}/> Resources</Link>
                  <Link href="/chat" className="mob-item" onClick={() => setMenuOpen(false)}><Bot size={13}/> AI Mentor</Link>
                  <Link href="/users" className="mob-item" onClick={() => setMenuOpen(false)}><Users size={13}/> Members</Link>
                  <Link href="/profile" className="mob-item" onClick={() => setMenuOpen(false)}><User size={13}/> Profile</Link>

                  <div className="mob-divider"/>
                  <Link href="/about" className="mob-item" onClick={() => setMenuOpen(false)}><Info size={13}/> About Us</Link>
                  <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="mob-item"><Globe size={13}/> Contact</a>
                  <Link href="/settings" className="mob-item" onClick={() => setMenuOpen(false)}><Settings size={13}/> Settings</Link>
                  <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="mob-item"><FileText size={13}/> Cover Page</a>
                  <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="mob-item"><Bus size={13}/> Transport</a>

                  <div className="mob-divider"/>
                  <button className="mob-item mob-item-danger" onClick={handleLogout}><LogOut size={13}/> Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}