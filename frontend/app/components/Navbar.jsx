'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot, Users, User, Bell, Settings, Info,
  FileText, Bus, LogOut, ChevronDown, Menu, X, Globe
} from 'lucide-react';
import Logo from './Logo';
import axios from 'axios';

export default function Navbar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const moreRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNotifCount(prev => prev !== res.data.count ? res.data.count : prev);
  } catch (err) { console.error(err); }
}, []);

useEffect(() => {
  fetchUnreadCount();
  const interval = setInterval(fetchUnreadCount, 60000);
  return () => clearInterval(interval);
}, [fetchUnreadCount]);   

  useEffect(() => {
    const handleClick = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="navbar">
      <div className="center-wrap" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.65rem 1.5rem'}}>
        {/* Logo */}
        <Link href="/dashboard" style={{display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none'}}>
          <Logo size={34}/>
          <div style={{lineHeight:1.1}}>
            <div style={{fontSize:'0.95rem', fontWeight:800, color:'#22c55e', letterSpacing:'-0.01em'}}>IIUC</div>
            <div style={{fontSize:'0.7rem', fontWeight:600, color:'rgba(255,255,255,0.5)', letterSpacing:'0.04em'}}>MentorBridge</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{display:'flex', alignItems:'center', gap:'1.25rem'}}>
          <Link href="/chat" className="nav-link"><Bot size={15}/> AI Mentor</Link>
          <Link href="/users" className="nav-link"><Users size={15}/> Members</Link>
          <Link href="/profile" className="nav-link"><User size={15}/> Profile</Link>
          <Link href="/notifications" className="nav-link" style={{position:'relative'}} onClick={() => setNotifCount(0)}>
            <Bell size={15}/>
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </Link>

          {/* More Dropdown */}
          <div ref={moreRef} style={{position:'relative'}}>
            <button onClick={() => setMoreOpen(!moreOpen)} className="nav-link" style={{background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.25rem'}}>
              <Menu size={15}/> More <ChevronDown size={12}/>
            </button>
            {moreOpen && (
              <div className="dropdown-menu" style={{position:'absolute', right:0, top:'calc(100% + 8px)', zIndex:50}}>
                <Link href="/about" className="dropdown-item" onClick={() => setMoreOpen(false)}>
                  <Info size={14}/> About Us
                </Link>
                <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}>
                  <Globe size={14}/> Contact Us
                </a>
                <Link href="/settings" className="dropdown-item" onClick={() => setMoreOpen(false)}>
                  <Settings size={14}/> Settings
                </Link>
                <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}>
                  <FileText size={14}/> Cover Page Generator
                </a>
                <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="dropdown-item" onClick={() => setMoreOpen(false)}>
                  <Bus size={14}/> Transport
                </a>
                <div className="dropdown-divider"/>
                <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                  <LogOut size={14}/> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{background:'transparent', border:'none', color:'#22c55e', cursor:'pointer'}} id="mob-btn">
          {menuOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/chat" className="nav-link" onClick={() => setMenuOpen(false)}><Bot size={15}/> AI Mentor</Link>
          <Link href="/users" className="nav-link" onClick={() => setMenuOpen(false)}><Users size={15}/> Members</Link>
          <Link href="/profile" className="nav-link" onClick={() => setMenuOpen(false)}><User size={15}/> Profile</Link>
          <Link href="/notifications" className="nav-link" onClick={() => { setMenuOpen(false); setNotifCount(0); }}>
            <Bell size={15}/> Notifications {notifCount > 0 && `(${notifCount})`}
          </Link>
          <div className="dropdown-divider"/>
          <Link href="/about" className="nav-link" onClick={() => setMenuOpen(false)}><Info size={15}/> About Us</Link>
          <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="nav-link"><Globe size={15}/> Contact</a>
          <Link href="/settings" className="nav-link" onClick={() => setMenuOpen(false)}><Settings size={15}/> Settings</Link>
          <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="nav-link"><FileText size={15}/> Cover Page</a>
          <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="nav-link"><Bus size={15}/> Transport</a>
          <div className="dropdown-divider"/>
          <button className="btn-danger" onClick={handleLogout} style={{width:'fit-content'}}><LogOut size={14}/> Logout</button>
        </div>
      )}
    </nav>
  );
}