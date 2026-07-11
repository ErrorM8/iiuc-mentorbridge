'use client';
import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const SettingRow = ({ icon: Icon, label, desc, right, onClick, danger }) => (
    <div onClick={onClick} style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor: onClick ? 'pointer' : 'default'}}
      onMouseEnter={e => { if(onClick) e.currentTarget.style.paddingLeft='0.25rem'; }}
      onMouseLeave={e => { if(onClick) e.currentTarget.style.paddingLeft='0'; }}>
      <div style={{width:'34px', height:'34px', borderRadius:'9px', background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
        <Icon size={16} color={danger ? '#f87171' : '#22c55e'}/>
      </div>
      <div style={{flex:1}}>
        <p style={{color: danger ? '#f87171' : 'rgba(255,255,255,0.85)', fontSize:'0.875rem', fontWeight:500}}>{label}</p>
        {desc && <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.72rem'}}>{desc}</p>}
      </div>
      {right}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} style={{width:'42px', height:'24px', borderRadius:'12px', background: value ? '#16a34a' : 'rgba(255,255,255,0.15)', position:'relative', cursor:'pointer', transition:'background 0.3s', flexShrink:0}}>
      <div style={{position:'absolute', top:'3px', left: value ? '21px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'white', transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>
        <h2 className="heading-text" style={{fontSize:'1.2rem', marginBottom:'1rem'}}>Settings</h2>

        {/* Profile Section */}
        <div className="post-card" style={{marginBottom:'0.65rem'}}>
          <div style={{display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.25rem 0 0.875rem', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:'0.5rem'}}>
            <div className="avatar" style={{width:'44px', height:'44px', fontSize:'1rem', borderRadius:'12px'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{fontWeight:600, color:'white', fontSize:'0.9rem'}}>{user?.name}</p>
              <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>{user?.role} • {user?.department}</p>
            </div>
          </div>

          <SettingRow icon={Shield} label="Edit Profile" desc="Update your name, bio, skills" right={<ChevronRight size={16} color="rgba(255,255,255,0.3)"/>} onClick={() => router.push('/profile')}/>
        </div>

        {/* Preferences */}
        <div className="post-card" style={{marginBottom:'0.65rem'}}>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem'}}>Preferences</p>
          <SettingRow icon={darkMode ? Moon : Sun} label="Dark Mode" desc="Toggle dark/light theme" right={<Toggle value={darkMode} onChange={() => setDarkMode(!darkMode)}/>}/>
          <SettingRow icon={Bell} label="Notifications" desc="Enable push notifications" right={<Toggle value={notifications} onChange={() => setNotifications(!notifications)}/>}/>
        </div>

        {/* Quick Links */}
        <div className="post-card" style={{marginBottom:'0.65rem'}}>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem'}}>Quick Links</p>
          <SettingRow icon={Shield} label="Cover Page Generator" desc="Generate IIUC cover pages" right={<ChevronRight size={16} color="rgba(255,255,255,0.3)"/>} onClick={() => window.open('https://iiuccoverpage.vercel.app/', '_blank')}/>
          <SettingRow icon={Shield} label="Transport" desc="IIUC transport schedule" right={<ChevronRight size={16} color="rgba(255,255,255,0.3)"/>} onClick={() => window.open('https://transport.iiuc.ac.bd/', '_blank')}/>
          <SettingRow icon={Shield} label="About MentorBridge" right={<ChevronRight size={16} color="rgba(255,255,255,0.3)"/>} onClick={() => router.push('/about')}/>
        </div>

        {/* Logout */}
        <div className="post-card">
          <SettingRow icon={LogOut} label="Logout" desc="Sign out of your account" danger onClick={handleLogout}/>
        </div>
      </div>
      <Footer/>
    </div>
  );
}