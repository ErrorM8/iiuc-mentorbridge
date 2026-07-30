'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Bell, BellOff, Shield, Eye, EyeOff, Save, Check, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    emailNotifications: false,
    connectionRequests: true,
    showOnline: true,
    showProfile: true,
    profileVisibility: 'everyone',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) { router.push('/login'); return; }
    if (userData) setUser(JSON.parse(userData));
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      // Apply dark mode on load
      if (!parsed.darkMode) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
    }
  }, [router]);

  const toggle = (key) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);

    // Apply immediately
    if (key === 'darkMode') {
      if (!newValue) {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
    }

    if (key === 'notifications') {
      if (newValue && 'Notification' in window) {
        Notification.requestPermission().then(perm => {
          if (perm !== 'granted') {
            setSettings(prev => ({ ...prev, notifications: false }));
          }
        });
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ value, onChange }) => (
    <button onClick={onChange} style={{
      width:'44px', height:'25px', borderRadius:'999px', border:'none', cursor:'pointer',
      background: value ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(255,255,255,0.15)',
      position:'relative', transition:'background 0.3s', flexShrink:0,
      boxShadow: value ? '0 0 10px rgba(34,197,94,0.3)' : 'none'
    }}>
      <div style={{
        position:'absolute', top:'3px',
        left: value ? '21px' : '3px',
        width:'19px', height:'19px', borderRadius:'50%', background:'white',
        transition:'left 0.25s ease', boxShadow:'0 1px 4px rgba(0,0,0,0.3)'
      }}/>
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="post-card" style={{marginBottom:'0.75rem'}}>
      <h3 style={{color:'#22c55e', fontWeight:700, fontSize:'0.875rem', marginBottom:'0.875rem', paddingBottom:'0.5rem', borderBottom:'1px solid rgba(34,197,94,0.12)'}}>{title}</h3>
      <div style={{display:'flex', flexDirection:'column'}}>
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, desc, value, onChange, color = '#22c55e' }) => (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.75rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
      <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flex:1}}>
        <div style={{width:'34px', height:'34px', borderRadius:'9px', background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <Icon size={16} color={color}/>
        </div>
        <div>
          <p style={{color:'rgba(255,255,255,0.85)', fontSize:'0.85rem', fontWeight:500}}>{label}</p>
          {desc && <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', marginTop:'0.1rem'}}>{desc}</p>}
        </div>
      </div>
      <ToggleSwitch value={value} onChange={onChange}/>
    </div>
  );

  return (
    <div className="page-bg">
      <Navbar user={user}/>
      <div className="center-wrap-sm" style={{flex:1, paddingTop:'1.25rem', paddingBottom:'2rem'}}>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem'}}>
          <h2 className="heading-text" style={{fontSize:'1.25rem'}}>Settings</h2>
          <button onClick={handleSave} className="btn-primary" style={{padding:'0.45rem 1.1rem', fontSize:'0.82rem', display:'flex', alignItems:'center', gap:'0.35rem'}}>
            {saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save</>}
          </button>
        </div>

        {/* Appearance */}
        <Section title="🎨 Appearance">
          <SettingRow
            icon={settings.darkMode ? Moon : Sun}
            label="Dark Mode"
            desc={settings.darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
            value={settings.darkMode}
            onChange={() => toggle('darkMode')}
          />
        </Section>

        {/* Notifications */}
        <Section title="🔔 Notifications">
          <SettingRow
            icon={settings.notifications ? Bell : BellOff}
            label="Push Notifications"
            desc="Get notified about activity on your account"
            value={settings.notifications}
            onChange={() => toggle('notifications')}
          />
          <SettingRow
            icon={Bell}
            label="Email Notifications"
            desc="Receive notifications via email (coming soon)"
            value={settings.emailNotifications}
            onChange={() => toggle('emailNotifications')}
            color="#60a5fa"
          />
          <SettingRow
            icon={Bell}
            label="Connection Requests"
            desc="Notify when someone sends you a request"
            value={settings.connectionRequests}
            onChange={() => toggle('connectionRequests')}
          />
        </Section>

        {/* Privacy */}
        <Section title="🔒 Privacy">
          <SettingRow
            icon={settings.showOnline ? Eye : EyeOff}
            label="Show Online Status"
            desc="Let others see when you're active"
            value={settings.showOnline}
            onChange={() => toggle('showOnline')}
            color="#a78bfa"
          />
          <SettingRow
            icon={settings.showProfile ? Eye : EyeOff}
            label="Public Profile"
            desc="Allow others to view your profile"
            value={settings.showProfile}
            onChange={() => toggle('showProfile')}
            color="#a78bfa"
          />
          <div style={{padding:'0.75rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
              <div style={{width:'34px', height:'34px', borderRadius:'9px', background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                <Shield size={16} color="#a78bfa"/>
              </div>
              <div style={{flex:1}}>
                <p style={{color:'rgba(255,255,255,0.85)', fontSize:'0.85rem', fontWeight:500}}>Profile Visibility</p>
                <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem', marginTop:'0.1rem'}}>Who can see your profile</p>
              </div>
              <select value={settings.profileVisibility}
                onChange={(e) => setSettings(prev => ({...prev, profileVisibility: e.target.value}))}
                className="input-field" style={{width:'140px', fontSize:'0.8rem', padding:'0.4rem 0.65rem'}}>
                <option value="everyone">Everyone</option>
                <option value="connections">Connections Only</option>
                <option value="iiucians">IIUCians Only</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Account */}
        <Section title="👤 Account">
          <div style={{padding:'0.5rem 0'}}>
            <div style={{display:'flex', flexDirection:'column', gap:'0.45rem', marginBottom:'0.875rem'}}>
              {[
                { label:'Name', value: user?.name },
                { label:'Email', value: user?.email },
                { label:'Role', value: user?.role },
                { label:'Department', value: user?.department },
                { label:'Batch', value: user?.batch },
              ].map(item => item.value && (
                <div key={item.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.35rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <span style={{color:'rgba(255,255,255,0.4)', fontSize:'0.8rem'}}>{item.label}</span>
                  <span style={{color:'rgba(255,255,255,0.75)', fontSize:'0.8rem', fontWeight:500}}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push('/profile')} className="btn-outline" style={{width:'100%', padding:'0.5rem', fontSize:'0.82rem'}}>
              Edit Profile →
            </button>
          </div>
        </Section>

        {/* Danger Zone */}
        <div className="post-card" style={{border:'1px solid rgba(239,68,68,0.2)', marginBottom:'0.75rem'}}>
          <h3 style={{color:'#f87171', fontWeight:700, fontSize:'0.875rem', marginBottom:'0.875rem'}}>⚠️ Danger Zone</h3>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userSettings');
            document.body.classList.remove('light-mode');
            router.push('/login');
          }} className="btn-danger" style={{width:'100%', padding:'0.6rem', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
            <LogOut size={14}/> Logout from All Devices
          </button>
        </div>

      </div>
      <Footer/>
    </div>
  );
}