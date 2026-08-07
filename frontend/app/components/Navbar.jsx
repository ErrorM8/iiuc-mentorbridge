'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Users, Bell, Settings, Info, FileText, Bus, LogOut, ChevronDown, Menu, X, Globe, MessageSquare, BookOpen, User, ShoppingBag, Droplets } from 'lucide-react';
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

  const navItems = [
    { href:'/messages', icon:<MessageSquare size={14}/>, label:'Messages' },
    { href:'/resources', icon:<BookOpen size={14}/>, label:'Resources' },
    { href:'/market', icon:<ShoppingBag size={14}/>, label:'Market' },
    { href:'/blood', icon:<Droplets size={14}/>, label:'Blood Bank' },
    { href:'/chat', icon:<Bot size={14}/>, label:'AI Mentor' },
    { href:'/users', icon:<Users size={14}/>, label:'Members' },
  ];

  const moreItems = [
    { href:'/profile', icon:<User size={14}/>, label:'Profile', internal:true },
    { href:'/about', icon:<Info size={14}/>, label:'About Us', internal:true },
    { href:'https://www.facebook.com/sakibul.sakif', icon:<Globe size={14}/>, label:'Contact Us', internal:false },
    { href:'/settings', icon:<Settings size={14}/>, label:'Settings', internal:true },
    { href:'https://iiuccoverpage.vercel.app/', icon:<FileText size={14}/>, label:'Cover Page', internal:false },
    { href:'https://transport.iiuc.ac.bd/', icon:<Bus size={14}/>, label:'Transport', internal:false },
  ];

  const mobileItems = [
    { href:'/messages', icon:<MessageSquare size={13}/>, label:'Messages', internal:true },
    { href:'/resources', icon:<BookOpen size={13}/>, label:'Resources', internal:true },
    { href:'/market', icon:<ShoppingBag size={13}/>, label:'Market', internal:true },
    { href:'/blood', icon:<Droplets size={13}/>, label:'Blood Bank', internal:true },
    { href:'/chat', icon:<Bot size={13}/>, label:'AI Mentor', internal:true },
    { href:'/users', icon:<Users size={13}/>, label:'Members', internal:true },
    { href:'/profile', icon:<User size={13}/>, label:'Profile', internal:true },
    { href:'/about', icon:<Info size={13}/>, label:'About Us', internal:true },
    { href:'https://www.facebook.com/sakibul.sakif', icon:<Globe size={13}/>, label:'Contact', internal:false },
    { href:'/settings', icon:<Settings size={13}/>, label:'Settings', internal:true },
    { href:'https://iiuccoverpage.vercel.app/', icon:<FileText size={13}/>, label:'Cover Page', internal:false },
    { href:'https://transport.iiuc.ac.bd/', icon:<Bus size={13}/>, label:'Transport', internal:false },
  ];

  return (
    <>
      <style>{`
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .nav-link-item {
          display:flex; align-items:center; gap:0.3rem;
          padding:0.4rem 0.6rem; border-radius:8px;
          color:rgba(255,255,255,0.65); font-size:0.78rem;
          text-decoration:none; transition:all 0.2s; white-space:nowrap;
          background:transparent; border:none; cursor:pointer;
        }
        .nav-link-item:hover { background:rgba(34,197,94,0.1); color:#22c55e; }
        .mob-dropdown {
          animation:slideDown 0.2s ease forwards;
          position:absolute; top:calc(100% + 4px); right:0;
          background:rgba(10,20,10,0.97); backdrop-filter:blur(24px);
          border:1px solid rgba(34,197,94,0.2); border-radius:12px;
          padding:0.35rem; min-width:185px; max-height:70vh;
          overflow-y:auto; z-index:200; box-shadow:0 8px 32px rgba(0,0,0,0.5);
        }
        .mob-dropdown::-webkit-scrollbar{width:3px}
        .mob-dropdown::-webkit-scrollbar-thumb{background:rgba(34,197,94,0.3);border-radius:999px}
        .mob-item {
          display:flex; align-items:center; gap:0.5rem;
          padding:0.42rem 0.65rem; border-radius:7px;
          color:rgba(255,255,255,0.7); font-size:0.78rem;
          text-decoration:none; cursor:pointer;
          background:transparent; border:none; width:100%; text-align:left;
          transition:background 0.15s, color 0.15s;
        }
        .mob-item:hover{background:rgba(34,197,94,0.1);color:#22c55e}
        .mob-divider{height:1px;background:rgba(34,197,94,0.12);margin:0.25rem 0}
        .mob-danger{color:rgba(239,68,68,0.7)!important}
        .mob-danger:hover{background:rgba(239,68,68,0.1)!important;color:#f87171!important}
        @media(min-width:1024px){.show-mobile{display:none!important}.hidden-mobile{display:flex!important}}
        @media(max-width:1023px){.hidden-mobile{display:none!important}.show-mobile{display:flex!important}}
      `}</style>

      <nav style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(15,25,13,0.95)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(34,197,94,0.12)',
      }}>
        <div style={{maxWidth:'1400px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 1.5rem', gap:'0.5rem'}}>

          {/* Logo */}
          <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none', flexShrink:0}}>
            <Logo size={30}/>
            <div style={{lineHeight:1.1}}>
              <div style={{fontSize:'0.88rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
              <div style={{fontSize:'0.58rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.04em'}}>MentorBridge</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden-mobile" style={{alignItems:'center', gap:'0.05rem', flex:1, justifyContent:'center'}}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="nav-link-item">
                {item.icon} {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden-mobile" style={{alignItems:'center', gap:'0.2rem', flexShrink:0}}>
            <Link href="/notifications" onClick={() => setNotifCount(0)} className="nav-link-item" style={{position:'relative'}}>
              <Bell size={15}/>
              {notifCount > 0 && (
                <span style={{position:'absolute', top:'-2px', right:'-2px', background:'#22c55e', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {notifCount}
                </span>
              )}
            </Link>

            <div ref={moreRef} style={{position:'relative'}}>
              <button onClick={() => setMoreOpen(!moreOpen)} className="nav-link-item">
                <Menu size={14}/> More <ChevronDown size={11} style={{transition:'transform 0.2s', transform: moreOpen ? 'rotate(180deg)' : 'none'}}/>
              </button>
              {moreOpen && (
                <div className="dropdown-menu" style={{position:'absolute', right:0, top:'calc(100% + 8px)', zIndex:50, minWidth:'190px'}}>
                  {moreItems.map(item => (
                    item.internal ?
                      <Link key={item.href} href={item.href} className="dropdown-item" onClick={() => setMoreOpen(false)}>{item.icon} {item.label}</Link> :
                      <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}>{item.icon} {item.label}</a>
                  ))}
                  <div className="dropdown-divider"/>
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}><LogOut size={14}/> Logout</button>
                </div>
              )}
            </div>

            <div style={{marginLeft:'0.25rem'}}>
              <Avatar user={user} size={30} radius="50%" onClick={() => router.push('/profile')}/>
            </div>
          </div>

          {/* Mobile Right */}
          <div className="show-mobile" style={{alignItems:'center', gap:'0.5rem', flexShrink:0}}>
            <Link href="/notifications" onClick={() => setNotifCount(0)} style={{position:'relative', color:'rgba(255,255,255,0.65)', display:'flex'}}>
              <Bell size={18}/>
              {notifCount > 0 && (
                <span style={{position:'absolute', top:'-4px', right:'-4px', background:'#22c55e', color:'white', borderRadius:'50%', width:'15px', height:'15px', fontSize:'0.58rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center'}}>
                  {notifCount}
                </span>
              )}
            </Link>
            <Avatar user={user} size={28} radius="50%" onClick={() => router.push('/profile')}/>
            <div ref={menuRef} style={{position:'relative'}}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{background:'transparent', border:'none', color:'#22c55e', cursor:'pointer', padding:'0.2rem', display:'flex', alignItems:'center'}}>
                {menuOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
              {menuOpen && (
                <div className="mob-dropdown">
                  <div style={{display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.65rem 0.5rem', borderBottom:'1px solid rgba(34,197,94,0.12)', marginBottom:'0.25rem'}}>
                    <Avatar user={user} size={28} radius="7px"/>
                    <div>
                      <p style={{color:'white', fontWeight:600, fontSize:'0.75rem', lineHeight:1.2}}>{user?.name || 'User'}</p>
                      <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.62rem'}}>{user?.role} • {user?.department}</p>
                    </div>
                  </div>
                  {mobileItems.map(item => (
                    item.internal ?
                      <Link key={item.href} href={item.href} className="mob-item" onClick={() => setMenuOpen(false)}>{item.icon} {item.label}</Link> :
                      <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className="mob-item" onClick={() => setMenuOpen(false)}>{item.icon} {item.label}</a>
                  ))}
                  <div className="mob-divider"/>
                  <button className="mob-item mob-danger" onClick={handleLogout}><LogOut size={13}/> Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}