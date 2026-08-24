'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Palette, Bell, Shield, Lock, Save, Eye, EyeOff, Droplets, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
// import Footer from '../components/Footer';
import Avatar from '../components/Avatar';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [bloodNotif, setBloodNotif] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showStudentId, setShowStudentId] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' });
  const [showPw, setShowPw] = useState({ current:false, newPw:false, confirm:false });
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const tkn = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!tkn) { router.push('/login'); return; }
    setToken(tkn);
    if (userData) setUser(JSON.parse(userData));

    const savedTheme = localStorage.getItem('theme');
    const dark = savedTheme !== 'light';
    setIsDark(dark);
    if (!dark) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');

    const fetchSettings = async () => {
      try {
        const u = JSON.parse(userData || '{}');
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}`, {
          headers: { Authorization: `Bearer ${tkn}` }
        });
        setBloodNotif(res.data.bloodNotifications !== false);
      } catch {}
    };
    if (userData) fetchSettings();
  }, [router]);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const saveNotif = async () => {
    setSaving(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        { bloodNotifications: bloodNotif },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved('notif');
      setTimeout(() => setSaved(''), 2500);
    } catch {} finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPw.length < 6) { setPwError('At least 6 characters'); return; }
    setPwLoading(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwForm({ current:'', newPw:'', confirm:'' });
      setSaved('pw');
      setTimeout(() => setSaved(''), 2500);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  // ── Toggle Component ─────────────────────────────────────────────
  const Toggle = ({ value, onChange, label, sub, color='#22c55e' }) => (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 0',gap:'1rem'}}>
      <div style={{flex:1}}>
        <p style={{fontSize:'0.9rem',fontWeight:500,marginBottom:'0.2rem'}}>{label}</p>
        {sub && <p style={{fontSize:'0.8rem',color:'var(--text3)'}}>{sub}</p>}
      </div>
      <button onClick={onChange} style={{
        width:'52px',height:'28px',borderRadius:'999px',border:'none',cursor:'pointer',flexShrink:0,
        background: value ? color : 'rgba(0,0,0,0.15)',
        position:'relative',transition:'background 0.25s ease',
        boxShadow: value ? `0 0 0 3px ${color}33` : 'none'
      }}>
        <div style={{
          position:'absolute',top:'3px',
          left: value ? '27px' : '3px',
          width:'22px',height:'22px',borderRadius:'50%',
          background:'white',transition:'left 0.25s ease',
          boxShadow:'0 2px 6px rgba(0,0,0,0.25)'
        }}/>
      </button>
    </div>
  );

  // ── Section Card ─────────────────────────────────────────────────
  const Section = ({ icon, title, children }) => (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : 'white',
      border: isDark ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(0,0,0,0.08)',
      borderRadius:'16px',
      marginBottom:'1rem',
      overflow:'hidden',
      boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
      transition:'all 0.2s'
    }}>
      <div style={{
        display:'flex',alignItems:'center',gap:'0.65rem',
        padding:'1.1rem 1.5rem',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
      }}>
        <span style={{color:'#22c55e'}}>{icon}</span>
        <h3 style={{fontWeight:700,fontSize:'0.95rem'}}>{title}</h3>
      </div>
      <div style={{padding:'0 1.5rem'}}>{children}</div>
    </div>
  );

  const divider = (
    <div style={{height:'1px',background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',margin:'0'}}/>
  );

  return (
    <div className="page-bg">
      <Sidebar user={user}/>
      <div className="main-with-sidebar">
        <div style={{maxWidth:'700px',margin:'0 auto',padding:'2rem 1.5rem 3rem',width:'100%'}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',gap:'0.65rem',marginBottom:'1.75rem'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'12px',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:'1.2rem'}}>⚙️</span>
            </div>
            <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:'1.6rem'}}>Settings</h1>
          </div>

          {/* Appearance */}
          <Section icon={<Palette size={18}/>} title="Appearance">
            <Toggle
              value={isDark}
              onChange={toggleDark}
              label="Dark Mode"
              sub={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              color="#22c55e"
            />
          </Section>

          {/* Notifications */}
          <Section icon={<Bell size={18}/>} title="Notifications">
            <Toggle
              value={bloodNotif}
              onChange={() => setBloodNotif(!bloodNotif)}
              label="Blood Request Notifications"
              sub="Get notified when someone with your blood group needs blood"
              color="#ef4444"
            />
            <div style={{paddingBottom:'1rem',display:'flex',justifyContent:'flex-end'}}>
              <button onClick={saveNotif} disabled={saving} className="btn-primary"
                style={{padding:'0.5rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <Save size={14}/>
                {saved==='notif' ? '✓ Saved!' : saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </Section>

          {/* Privacy */}
          <Section icon={<Shield size={18}/>} title="Privacy">
            <Toggle
              value={showEmail}
              onChange={() => setShowEmail(!showEmail)}
              label="Show Email to Members"
              sub="Allow other members to see your email address"
            />
            {divider}
            <Toggle
              value={showStudentId}
              onChange={() => setShowStudentId(!showStudentId)}
              label="Show Student ID"
              sub="Display your IIUC Student ID on your public profile"
            />
          </Section>

          {/* Change Password */}
          <Section icon={<Lock size={18}/>} title="Change Password">
            <form onSubmit={handlePasswordChange} style={{paddingTop:'0.5rem',paddingBottom:'1rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {[
                { field:'current', label:'Current Password', show:showPw.current },
                { field:'newPw', label:'New Password', show:showPw.newPw },
                { field:'confirm', label:'Confirm New Password', show:showPw.confirm },
              ].map(item => (
                <div key={item.field}>
                  <label style={{fontSize:'0.78rem',fontWeight:600,display:'block',marginBottom:'0.3rem',color:'var(--text2)'}}>
                    {item.label}
                  </label>
                  <div style={{position:'relative'}}>
                    <input type={item.show?'text':'password'}
                      value={pwForm[item.field]}
                      onChange={e=>setPwForm(p=>({...p,[item.field]:e.target.value}))}
                      className="input-field" placeholder={item.label}
                      style={{paddingRight:'2.5rem'}}/>
                    <button type="button"
                      onClick={()=>setShowPw(p=>({...p,[item.field]:!p[item.field]}))}
                      style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',display:'flex',alignItems:'center'}}>
                      {item.show ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
              ))}

              {pwError && (
                <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.65rem 0.875rem'}}>
                  <p style={{color:'#f87171',fontSize:'0.82rem'}}>{pwError}</p>
                </div>
              )}
              {saved==='pw' && (
                <div style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:'10px',padding:'0.65rem 0.875rem'}}>
                  <p style={{color:'#22c55e',fontSize:'0.82rem'}}>✓ Password changed successfully!</p>
                </div>
              )}

              <button type="submit" disabled={pwLoading||!pwForm.current||!pwForm.newPw||!pwForm.confirm}
                className="btn-primary"
                style={{padding:'0.55rem 1.25rem',fontSize:'0.85rem',display:'flex',alignItems:'center',gap:'0.4rem',width:'fit-content'}}>
                <Lock size={14}/>
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </Section>

          {/* Account Info */}
          <Section icon={<Shield size={18}/>} title="Account">
            <div style={{padding:'0.875rem 0',display:'flex',alignItems:'center',gap:'0.875rem'}}>
              <Avatar user={user} size={44} radius="12px"/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:700,fontSize:'0.9rem'}}>{user?.name}</p>
                <p style={{fontSize:'0.8rem',color:'var(--text3)',marginTop:'0.1rem'}}>{user?.email}</p>
                <p style={{fontSize:'0.75rem',color:'#22c55e',marginTop:'0.1rem',fontWeight:600}}>
                  ● {user?.role} • {user?.department}
                </p>
              </div>
            </div>
            {divider}
            <div style={{padding:'0.875rem 0'}}>
              <button onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                document.body.classList.remove('light-mode');
                router.push('/login');
              }} style={{
                display:'flex',alignItems:'center',gap:'0.5rem',
                background:'transparent',border:'1px solid rgba(239,68,68,0.3)',
                borderRadius:'10px',padding:'0.55rem 1.1rem',
                color:'rgba(239,68,68,0.8)',cursor:'pointer',fontSize:'0.85rem',fontWeight:600,
                transition:'all 0.2s'
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#f87171';}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(239,68,68,0.8)';}}>
                <LogOut size={15}/> Logout
              </button>
            </div>
          </Section>

        </div>
        {/* <Footer/> */}
      </div>
    </div>
  );
}