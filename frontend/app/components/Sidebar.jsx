'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, Bot, Users, BookOpen,
  ShoppingBag, Droplets, Settings, LogOut, Bell, User,
  HelpCircle, Zap, Menu, X, Globe, Info, FileText, Bus
} from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';
import axios from 'axios';

export default function Sidebar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const [notifRes, msgRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/messages/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setNotifCount(notifRes.data.count || 0);
      setMsgCount(msgRes.data.count || 0);
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.body.classList.remove('light-mode');
    router.push('/login');
  };

  const isActive = (href) =>
    pathname === href || (href !== '/dashboard' && pathname?.startsWith(href + '/'));

    const navLinks = [
      { href:'/dashboard', icon:<LayoutDashboard size={18}/>, label:'Dashboard' },
      { href:'/messages', icon:<MessageSquare size={18}/>, label:'Messages', badge: msgCount },
      { href:'/chat', icon:<Bot size={18}/>, label:'AI Mentor' },
      { href:'/users', icon:<Users size={18}/>, label:'Members' },
      { href:'/resources', icon:<BookOpen size={18}/>, label:'Resources' },
      { href:'/market', icon:<ShoppingBag size={18}/>, label:'Market' },
      { href:'/blood', icon:<Droplets size={18}/>, label:'Blood Bank' },
      { href:'/profile', icon:<User size={18}/>, label:'Profile' },
      { href:'/settings', icon:<Settings size={18}/>, label:'Settings' },
      { href:'/about', icon:<Info size={18}/>, label:'About' },
    ];

    const externalLinks = [
      { href:'https://www.facebook.com/sakibul.sakif', icon:<Globe size={17}/>, label:'Contact Us' },
      { href:'https://iiuccoverpage.vercel.app/', icon:<FileText size={17}/>, label:'Cover Page' },
      { href:'https://transport.iiuc.ac.bd/', icon:<Bus size={17}/>, label:'Transport' },
    ];

    const NavItem = ({ href, icon, label, badge, onClick }) => {
    const active = isActive(href);
    return (
      <Link href={href} onClick={onClick} style={{
        display:'flex', alignItems:'center', gap:'0.75rem',
        padding:'0.58rem 0.875rem', borderRadius:'10px',
        color: active ? '#22c55e' : 'var(--text2)',
        background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
        textDecoration:'none', fontSize:'0.84rem',
        fontWeight: active ? 600 : 500,
        transition:'all 0.18s ease',
        borderLeft: active ? '3px solid #22c55e' : '3px solid transparent',
      }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(34,197,94,0.07)';
            e.currentTarget.style.color = 'var(--text)';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text2)';
          }
        }}>
        <span style={{color: active ? '#22c55e' : 'var(--text3)', flexShrink:0}}>{icon}</span>
        <span style={{flex:1}}>{label}</span>
        {badge > 0 && (
          <span style={{background:'#22c55e', color:'white', borderRadius:'999px', fontSize:'0.6rem', fontWeight:800, padding:'1px 6px', flexShrink:0}}>
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
    );
  };

  const ExternalItem = ({ href, icon, label, onClick }) => (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:'0.75rem',
      padding:'0.58rem 0.875rem', borderRadius:'10px',
      color:'rgba(255,255,255,0.45)', textDecoration:'none',
      fontSize:'0.82rem', fontWeight:500,
      transition:'all 0.18s ease',
      borderLeft:'3px solid transparent',
    }}
      onMouseEnter={e => { e.currentTarget.style.background='rgba(34,197,94,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}>
      <span style={{color:'rgba(255,255,255,0.3)', flexShrink:0}}>{icon}</span>
      {label}
    </a>
  );

  const SidebarContent = ({ onItemClick }) => (
    <>
      {/* Logo */}
      <div style={{padding:'1.2rem 1rem 1rem', borderBottom:'1px solid rgba(34,197,94,0.08)', flexShrink:0}}>
        <Link href="/dashboard" onClick={onItemClick} style={{display:'flex',alignItems:'center',gap:'0.6rem',textDecoration:'none'}}>
          <Logo size={32}/>
          <div>
            <div style={{fontSize:'1rem',fontWeight:800,color:'#22c55e',letterSpacing:'-0.01em'}}>MentorBridge</div>
            <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',letterSpacing:'0.05em'}}>IIUC Student Hub</div>
          </div>
        </Link>
      </div>

      {/* User + Notifications */}
      <div style={{padding:'0.75rem',borderBottom:'1px solid rgba(34,197,94,0.08)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <Link href="/profile" onClick={onItemClick} style={{
            textDecoration:'none',display:'flex',alignItems:'center',gap:'0.6rem',flex:1,minWidth:0,
            padding:'0.45rem 0.5rem',borderRadius:'10px',transition:'background 0.2s'
          }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(34,197,94,0.07)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <Avatar user={user} size={34} radius="9px"/>
            <div style={{flex:1,minWidth:0}}>
              <p style={{color:'var(--text)', fontWeight:600, fontSize:'0.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {user?.name || 'User'}
            </p>
            <p style={{color:'#22c55e', fontSize:'0.68rem', fontWeight:500}}>● {user?.role}</p>
            </div>
          </Link>
          <Link href="/notifications" onClick={()=>{setNotifCount(0);onItemClick?.();}} style={{
            position:'relative',color:'rgba(255,255,255,0.45)',display:'flex',alignItems:'center',
            padding:'0.45rem',borderRadius:'8px',textDecoration:'none',transition:'all 0.2s',flexShrink:0
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.1)';e.currentTarget.style.color='#22c55e';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.45)';}}>
            <Bell size={17}/>
            {notifCount > 0 && (
              <span style={{
                position:'absolute',top:'-2px',right:'-2px',background:'#ef4444',color:'white',
                borderRadius:'50%',width:'15px',height:'15px',fontSize:'0.55rem',fontWeight:800,
                display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse3d 2s infinite'
              }}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Nav Links — all flat, no sections */}
      <div style={{flex:1,padding:'0.5rem 0.625rem',display:'flex',flexDirection:'column',gap:'0.08rem',overflowY:'auto'}}>
        {navLinks.map(item => (
          <NavItem key={item.href} {...item} onClick={onItemClick}/>
        ))}

        {/* Divider */}
        <div style={{height:'1px',background:'rgba(34,197,94,0.08)',margin:'0.4rem 0'}}/>

        {/* External links */}
        {externalLinks.map(item => (
          <ExternalItem key={item.href} {...item} onClick={onItemClick}/>
        ))}
      </div>

      {/* Bottom */}
      <div style={{padding:'0.75rem',borderTop:'1px solid rgba(34,197,94,0.08)',flexShrink:0,display:'flex',flexDirection:'column',gap:'0.2rem'}}>
        <Link href="/chat" onClick={onItemClick} style={{
          display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem',
          padding:'0.6rem',borderRadius:'10px',textDecoration:'none',
          background:'linear-gradient(135deg,#16a34a,#0f3d2e)',
          color:'white',fontWeight:700,fontSize:'0.82rem',
          boxShadow:'0 4px 16px rgba(34,197,94,0.25)',marginBottom:'0.15rem',
          transition:'opacity 0.2s'
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          <Zap size={15}/> Get AI Help
        </Link>
        <button onClick={handleLogout} style={{
          display:'flex',alignItems:'center',gap:'0.75rem',
          padding:'0.5rem 0.875rem',borderRadius:'9px',
          color:'rgba(239,68,68,0.65)',fontSize:'0.8rem',
          background:'transparent',border:'none',cursor:'pointer',
          width:'100%',textAlign:'left',transition:'all 0.2s'
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#f87171';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(239,68,68,0.65)';}}>
          <LogOut size={16}/> Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden-mobile" style={{
        position:'fixed',top:0,left:0,
        width:'var(--sidebar-w)',height:'100vh',
        background:'rgba(8,14,8,0.97)',
        backdropFilter:'blur(32px)',
        borderRight:'1px solid rgba(34,197,94,0.1)',
        zIndex:100,display:'flex',flexDirection:'column',
        overflowY:'auto',overflowX:'hidden',
      }}>
        <SidebarContent/>
      </aside>

      {/* Mobile Top Bar */}
      <div className="show-mobile" style={{
        position:'fixed',top:0,left:0,right:0,height:'56px',
        background:'rgba(8,14,8,0.97)',backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(34,197,94,0.1)',
        zIndex:100,display:'flex',alignItems:'center',
        justifyContent:'space-between',padding:'0 1rem'
      }}>
        <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:'0.45rem',textDecoration:'none'}}>
          <Logo size={26}/>
          <div style={{fontSize:'0.9rem',fontWeight:800,color:'#22c55e'}}>MentorBridge</div>
        </Link>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <Link href="/notifications" onClick={()=>setNotifCount(0)} style={{
            position:'relative',color:'rgba(255,255,255,0.6)',
            display:'flex',alignItems:'center',padding:'0.4rem',borderRadius:'8px',textDecoration:'none'
          }}>
            <Bell size={18}/>
            {notifCount > 0 && (
              <span style={{position:'absolute',top:'-2px',right:'-2px',background:'#ef4444',color:'white',borderRadius:'50%',width:'14px',height:'14px',fontSize:'0.52rem',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </Link>
          <button onClick={()=>setMobileOpen(!mobileOpen)} style={{
            background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',
            color:'#22c55e',cursor:'pointer',padding:'0.35rem',
            display:'flex',alignItems:'center',borderRadius:'8px',transition:'all 0.2s'
          }}>
            {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div onClick={()=>setMobileOpen(false)} style={{
            position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:150,animation:'fadeIn 0.2s ease'
          }}/>
          <div style={{
            position:'fixed',top:0,left:0,width:'280px',height:'100vh',
            background:'rgba(8,14,8,0.99)',backdropFilter:'blur(32px)',
            borderRight:'1px solid rgba(34,197,94,0.15)',
            zIndex:200,display:'flex',flexDirection:'column',
            overflowY:'auto',animation:'slideRight 0.25s ease'
          }}>
            <SidebarContent onItemClick={()=>setMobileOpen(false)}/>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideRight{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes pulse3d{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.3)}50%{box-shadow:0 0 0 4px rgba(34,197,94,0)}}
      `}</style>
    </>
  );
}