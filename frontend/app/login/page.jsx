'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import Logo from '../components/Logo';

const DEPARTMENTS = [
  'CSE','CCE','EEE','ETE','Civil Engineering','Pharmacy',
  'BBA','MBA','English','Arabic','LIS','Law',
  'Economics & Banking','QSIS','DIS','SHIS'
];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
const API = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCompletion, setShowCompletion] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completionForm, setCompletionForm] = useState({
    batch: '', department: '', role: 'junior',
    studentId: '', bloodGroup: '', gender: 'male',
    bio: '', skills: '',
  });

  const googleBtnRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  const handleGoogleSuccess = useCallback(async (response) => {
    setError('');
    try {
      const res = await axios.post(`${API}/auth/google`, { credential: response.credential });

      if (res.data.isNewUser) {
        setGoogleData(res.data.googleData);
        setShowCompletion(true);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed. Please try again.');
    }
  }, [router]);

  // Render Google's official button (more reliable than One Tap prompt)
  useEffect(() => {
    if (showCompletion) return;

    if (!GOOGLE_CLIENT_ID) {
      console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
      return;
    }

    const init = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSuccess,
      });
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'filled_black',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 300,
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script.removeEventListener('load', init);
  }, [showCompletion, handleGoogleSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleGoogleCompletion = async (e) => {
    e.preventDefault();
    setCompletionError('');
    if (!completionForm.department) { setCompletionError('Department is required'); return; }
    if (!completionForm.batch.trim()) { setCompletionError('Batch is required'); return; }
    if (!completionForm.studentId.trim()) { setCompletionError('Student ID is required'); return; }
    setCompleting(true);
    try {
      const res = await axios.post(`${API}/auth/google-complete`, {
        ...googleData,
        ...completionForm,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setCompletionError(err.response?.data?.message || 'Failed to complete registration');
    } finally { setCompleting(false); }
  };

  const labelStyle = { color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.3rem' };

  // ── Google completion form ──
  if (showCompletion && googleData) {
    return (
      <div style={{minHeight:'100vh',background:'#0f150d',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'1.5rem 1rem 2rem'}}>
        <div className="fade-in" style={{width:'100%',maxWidth:'560px',paddingTop:'1rem'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'0.875rem'}}><Logo size={48}/></div>
            <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.6rem',fontWeight:800}}>
              Complete Your Profile
            </h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',marginTop:'0.35rem'}}>
              Welcome, <strong style={{color:'#22c55e'}}>{googleData.name}</strong>! Fill in your IIUC details to continue.
            </p>
          </div>

          <div className="glass-card" style={{padding:'1.75rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'rgba(34,197,94,0.06)',borderRadius:'10px',border:'1px solid rgba(34,197,94,0.15)',marginBottom:'1.25rem'}}>
              {googleData.avatar && (
                <img src={googleData.avatar} alt="" style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover'}}/>
              )}
              <div style={{minWidth:0}}>
                <p style={{color:'white',fontWeight:600,fontSize:'0.875rem'}}>{googleData.name}</p>
                <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem'}}>{googleData.email}</p>
              </div>
              <div style={{marginLeft:'auto',background:'rgba(34,197,94,0.12)',borderRadius:'8px',padding:'3px 8px'}}>
                <span style={{color:'#22c55e',fontSize:'0.7rem',fontWeight:700}}>Google ✓</span>
              </div>
            </div>

            <form onSubmit={handleGoogleCompletion}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'0.75rem'}}>
                <div>
                  <label style={labelStyle}>Role <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={completionForm.role} onChange={e=>setCompletionForm(p=>({...p,role:e.target.value}))} className="input-field">
                    <option value="junior">Junior (Current Student)</option>
                    <option value="senior">Senior (Alumni)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Department <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={completionForm.department} onChange={e=>setCompletionForm(p=>({...p,department:e.target.value}))} className="input-field">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Batch <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="text" value={completionForm.batch} onChange={e=>setCompletionForm(p=>({...p,batch:e.target.value}))} className="input-field" placeholder="e.g. 57"/>
                </div>
                <div>
                  <label style={labelStyle}>Student ID <span style={{color:'#ef4444'}}>*</span></label>
                  <input type="text" value={completionForm.studentId} onChange={e=>setCompletionForm(p=>({...p,studentId:e.target.value}))} className="input-field" placeholder="e.g. C241268"/>
                </div>
                <div>
                  <label style={labelStyle}>Gender <span style={{color:'#ef4444'}}>*</span></label>
                  <select value={completionForm.gender} onChange={e=>setCompletionForm(p=>({...p,gender:e.target.value}))} className="input-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Blood Group</label>
                  <select value={completionForm.bloodGroup} onChange={e=>setCompletionForm(p=>({...p,bloodGroup:e.target.value}))} className="input-field">
                    <option value="">Select (optional)</option>
                    {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={labelStyle}>Skills (optional)</label>
                  <input type="text" value={completionForm.skills} onChange={e=>setCompletionForm(p=>({...p,skills:e.target.value}))} className="input-field" placeholder="e.g. React, Python, Figma..."/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={labelStyle}>About Me (optional)</label>
                  <textarea value={completionForm.bio} onChange={e=>setCompletionForm(p=>({...p,bio:e.target.value}))} rows={2} className="input-field" style={{resize:'none'}} placeholder="Tell the community about yourself..."/>
                </div>
              </div>

              {completionError && (
                <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',padding:'0.75rem 1rem',marginTop:'0.875rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <AlertCircle size={15} color="#f87171"/>
                  <p style={{color:'#f87171',fontSize:'0.82rem'}}>{completionError}</p>
                </div>
              )}

              <button type="submit" disabled={completing} className="btn-primary"
                style={{width:'100%',padding:'0.8rem',fontSize:'0.9rem',marginTop:'1.125rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
                {completing ? 'Creating Account...' : <><Check size={16}/> Complete Registration →</>}
              </button>

              <button type="button" onClick={()=>{setShowCompletion(false);setGoogleData(null);}}
                style={{width:'100%',padding:'0.5rem',marginTop:'0.5rem',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'0.78rem'}}>
                ← Use a different account
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Login form ──
  return (
    <div style={{minHeight:'100vh',background:'#0f150d',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div className="fade-in" style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}><Logo size={56}/></div>
          <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.9rem',fontWeight:800}}>
            Welcome Back
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.82rem',marginTop:'0.35rem'}}>Sign in to IIUC MentorBridge</p>
        </div>

        <div className="glass-card" style={{padding:'1.875rem'}}>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="input-field" placeholder="your@email.com" autoComplete="email" autoFocus/>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={{position:'relative'}}>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  className="input-field" placeholder="Your password" autoComplete="current-password" style={{paddingRight:'2.5rem'}}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer'}}>
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              <div style={{textAlign:'right',marginTop:'0.35rem'}}>
                <Link href="/forgot-password" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem',textDecoration:'none'}}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',padding:'0.75rem 1rem',display:'flex',alignItems:'flex-start',gap:'0.5rem'}}>
                <AlertCircle size={15} color="#f87171" style={{flexShrink:0,marginTop:'1px'}}/>
                <p style={{color:'#f87171',fontSize:'0.82rem',lineHeight:'1.5'}}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{width:'100%',padding:'0.8rem',fontSize:'0.9rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',margin:'1.25rem 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}}/>
            <span style={{color:'rgba(255,255,255,0.25)',fontSize:'0.75rem'}}>OR</span>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}}/>
          </div>

          {/* Google's official button renders here */}
          <div style={{display:'flex',justifyContent:'center',minHeight:'44px'}}>
            <div ref={googleBtnRef}/>
          </div>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'0.82rem',marginTop:'1.25rem'}}>
            Don't have an account?{' '}
            <Link href="/register" style={{color:'#22c55e',textDecoration:'none',fontWeight:700}}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}