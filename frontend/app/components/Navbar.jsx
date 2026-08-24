'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Menu, X, MessageSquare, Bot, Users, Settings, Info, Globe, FileText, Bus, LogOut, BookOpen, ShoppingBag, Droplets, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import axios from 'axios';

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const menuRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.body.classList.remove('light-mode');
    router.push('/login');
  };

  const isActive = (href) => pathname === href;

  // Pinned nav items — desktop center
  const pinnedItems = [
    { href:'/messages', icon:<MessageSquare size={16}/>, label:'Messages' },
    { href:'/chat', icon:<Bot size={16}/>, label:'AI Mentor' },
    { href:'/users', icon:<Users size={16}/>, label:'Members' },
  ];

  // Mobile menu all items
  const allMobileItems = [
    { href:'/dashboard', icon:<LayoutDashboard size={15}/>, label:'Dashboard' },
    { href:'/messages', icon:<MessageSquare size={15}/>, label:'Messages' },
    { href:'/chat', icon:<Bot size={15}/>, label:'AI Mentor' },
    { href:'/users', icon:<Users size={15}/>, label:'Members' },
    { href:'/resources', icon:<BookOpen size={15}/>, label:'Resources' },
    { href:'/market', icon:<ShoppingBag size={15}/>, label:'Market' },
    { href:'/blood', icon:<Droplets size={15}/>, label:'Blood Bank' },
    { href:'/profile', icon:<User size={15}/>, label:'Profile' },
    { href:'/settings', icon:<Settings size={15}/>, label:'Settings' },
    { href:'/about', icon:<Info size={15}/>, label:'About Us' },
  ];

  return (
    <>
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-w);
          right: 0;
          height: var(--navbar-h);
          z-index: 90;
          background: rgba(10,16,10,0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(34,197,94,0.1);
          transition: left 0.3s ease;
        }
        @media (max-width: 1023px) { .navbar { left: 0; } }
        .nav-pinned {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .nav-pinned-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.875rem;
          border-radius: 10px;
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-pinned-item:hover {
          background: rgba(34,197,94,0.1);
          color: #22c55e;
        }
        .nav-pinned-item.active {
          background: rgba(34,197,94,0.12);
          color: #22c55e;
          font-weight: 600;
        }
        .nav-pinned-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: #22c55e;
          border-radius: 999px;
        }
        @keyframes mobSlide {
          from { opacity:0; transform:translateY(-10px) scale(0.97); }
          to { opacity:1; transform:translateY(0) scale(1); }
        }
        .mob-panel {
          animation: mobSlide 0.2s ease forwards;
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: rgba(8,14,8,0.97);
          backdrop-filter: blur(28px);
          border: 1px solid rgba(34,197,94,0.15);
          border-radius: 14px;
          padding: 0.4rem;
          min-width: 200px;
          max-height: 75vh;
          overflow-y: auto;
          z-index: 200;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .mob-panel::-webkit-scrollbar { width: 3px; }
        .mob-panel::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 999px; }
        .mob-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.48rem 0.7rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          font-size: 0.8rem;
          text-decoration: none;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          font-weight: 500;
        }
        .mob-item:hover { background: rgba(34,197,94,0.1); color: #22c55e; }
        .mob-item.mob-active { background: rgba(34,197,94,0.12); color: #22c55e; font-weight: 600; }
        .mob-divider { height: 1px; background: rgba(34,197,94,0.1); margin: 0.3rem 0; }
        .mob-danger { color: rgba(239,68,68,0.7) !important; }
        .mob-danger:hover { background: rgba(239,68,68,0.1) !important; color: #f87171 !important; }
      `}</style>

      <nav className="navbar">
        <div style={{height:'100%', maxWidth:'1400px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.25rem', gap:'1rem'}}>

          {/* Mobile Logo */}
          <Link href="/dashboard" className="show-mobile" style={{display:'flex', alignItems:'center', gap:'0.45rem', textDecoration:'none', flexShrink:0}}>
            <Logo size={28}/>
            <div style={{lineHeight:1.1}}>
              <div style={{fontSize:'0.82rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
              <div style={{fontSize:'0.55rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.04em'}}>MentorBridge</div>
            </div>
          </Link>

          {/* Desktop Center — Pinned Pages */}
          <div className="nav-pinned hidden-mobile" style={{position:'absolute', left:'50%', transform:'translateX(-50%)'}}>
            {pinnedItems.map(item => (
              <Link key={item.href} href={item.href}
                className={`nav-pinned-item ${isActive(item.href) ? 'active' : ''}`}>
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop spacer */}
          <div className="hidden-mobile" style={{flex:1}}/>

          {/* Right side */}
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0}}>

            {/* Notifications */}
            <Link href="/notifications" onClick={() => setNotifCount(0)}
              style={{position:'relative', color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', padding:'0.4rem', borderRadius:'9px', transition:'all 0.2s', textDecoration:'none'}}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.1)'; e.currentTarget.style.color='#22c55e'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; }}>
              <Bell size={18}/>
              {notifCount > 0 && (
                <span className="notif-badge" style={{top:'-3px', right:'-3px', width:'16px', height:'16px', fontSize:'0.58rem'}}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </Link>

            {/* Desktop Avatar */}
            <div className="hidden-mobile">
              <Avatar user={user} size={30} radius="50%" onClick={() => router.push('/profile')}/>
            </div>

            {/* Mobile: Avatar + Hamburger */}
            <div className="show-mobile" style={{alignItems:'center', gap:'0.4rem'}}>
              <Avatar user={user} size={28} radius="50%" onClick={() => router.push('/profile')}/>
              <div ref={menuRef} style={{position:'relative'}}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'#22c55e', cursor:'pointer', padding:'0.35rem', display:'flex', alignItems:'center', borderRadius:'8px', transition:'all 0.2s'}}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(34,197,94,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}>
                  {menuOpen ? <X size={18}/> : <Menu size={18}/>}
                </button>

                {menuOpen && (
                  <div className="mob-panel">
                    {/* User info */}
                    <div style={{display:'flex', alignItems:'center', gap:'0.55rem', padding:'0.5rem 0.7rem 0.6rem', borderBottom:'1px solid rgba(34,197,94,0.1)', marginBottom:'0.3rem'}}>
                      <Avatar user={user} size={30} radius="8px"/>
                      <div>
                        <p style={{color:'white', fontWeight:600, fontSize:'0.78rem', lineHeight:1.2}}>{user?.name || 'User'}</p>
                        <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.65rem'}}>{user?.role} • {user?.department}</p>
                      </div>
                    </div>

                    {allMobileItems.map(item => (
                      <Link key={item.href} href={item.href}
                        className={`mob-item ${isActive(item.href) ? 'mob-active' : ''}`}
                        onClick={() => setMenuOpen(false)}>
                        <span style={{color: isActive(item.href) ? '#22c55e' : 'rgba(255,255,255,0.4)'}}>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <div className="mob-divider"/>
                    <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="mob-item">
                      <span style={{color:'rgba(255,255,255,0.4)'}}><Globe size={15}/></span> Contact
                    </a>
                    <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="mob-item">
                      <span style={{color:'rgba(255,255,255,0.4)'}}><FileText size={15}/></span> Cover Page
                    </a>
                    <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="mob-item">
                      <span style={{color:'rgba(255,255,255,0.4)'}}><Bus size={15}/></span> Transport
                    </a>
                    <div className="mob-divider"/>
                    <button className="mob-item mob-danger" onClick={handleLogout}>
                      <LogOut size={15}/> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}