'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn } from 'lucide-react';
import Logo from '../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem'}}>
      <div className="fade-in" style={{width:'100%', maxWidth:'380px'}}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
         <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}>
          <Logo size={52}/>
        </div>
  <h1 className="gradient-text" style={{fontSize:'1.8rem', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.2}}>
    IIUC MentorBridge
  </h1>
  <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.35rem'}}>Senior-Junior Network</p>
</div>

        <div className="glass-card" style={{padding:'1.75rem'}}>
          {error && <div className="alert-error" style={{marginBottom:'1rem'}}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
            <div>
              <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem', marginBottom:'0.35rem'}}>
                <Mail size={12}/> Email Address
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="your@email.com"/>
            </div>
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.35rem'}}>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem'}}>
                  <Lock size={12}/> Password
                </label>
                <Link href="/forgot-password" style={{color:'#22c55e', fontSize:'0.72rem', textDecoration:'none'}}>Forgot password?</Link>
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="••••••••"/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem', marginTop:'0.25rem'}}>
              <LogIn size={15}/> {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="divider"/>
          <p style={{textAlign:'center', fontSize:'0.78rem', color:'rgba(255,255,255,0.35)'}}>
            No account? <Link href="/register" style={{color:'#22c55e', fontWeight:600, textDecoration:'none'}}>Create Account</Link>
          </p>
        </div>

        <p style={{textAlign:'center', marginTop:'1rem', fontSize:'0.7rem', color:'rgba(255,255,255,0.2)'}}>
          <Link href="/about" style={{color:'rgba(255,255,255,0.3)', textDecoration:'none'}}>About</Link>
          {' · '}
          <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" style={{color:'rgba(255,255,255,0.3)', textDecoration:'none'}}>Contact</a>
        </p>
      </div>
    </div>
  );
}