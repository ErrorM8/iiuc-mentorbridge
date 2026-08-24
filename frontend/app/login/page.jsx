'use client';
import { useState, useEffect } from 'react';
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google completion form state
  const [showCompletion, setShowCompletion] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completionError, setCompletionError] = useState('');
  const [completionForm, setCompletionForm] = useState({
    batch: '', department: '', role: 'junior',
    studentId: '', bloodGroup: '', gender: 'male',
    bio: '', skills: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push('/dashboard');
  }, [router]);

  // Load Google Identity
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.needsVerification) {
        setError(`${msg} Check your email for OTP.`);
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (response) => {
    setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        credential: response.credential,
      });

      if (res.data.isNewUser) {
        // New user — show completion form
        setGoogleData(res.data.googleData);
        setShowCompletion(true);
        return;
      }

      // Existing user — login directly
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  const handleGoogleCompletion = async (e) => {
    e.preventDefault();
    setCompletionError('');
    if (!completionForm.department) {
      setCompletionError('Department is required');
      return;
    }
    if (!completionForm.batch.trim()) {
      setCompletionError('Batch is required');
      return;
    }
    if (!completionForm.studentId.trim()) {
      setCompletionError('Student ID is required');
      return;
    }
    setCompleting(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-complete`, {
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

  const initGoogleSignIn = () => {
    if (!window.google) {
      setError('Google Sign-In is not loaded yet. Please try again.');
      return;
    }
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleSuccess,
    });
    window.google.accounts.id.prompt();
  };

  // ── Google Completion Form ───────────────────────────────────────
  if (showCompletion && googleData) {
    return (
      <div style={{minHeight:'100vh',background:'#0f150d',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'1.5rem 1rem 2rem'}}>
        <div className="fade-in" style={{width:'100%',maxWidth:'560px',paddingTop:'1rem'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'0.875rem'}}>
              <Logo size={48}/>
            </div>
            <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.6rem',fontWeight:800}}>
              Complete Your Profile
            </h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',marginTop:'0.35rem'}}>
              Welcome, <strong style={{color:'#22c55e'}}>{googleData.name}</strong>! Fill in your IIUC details to continue.
            </p>
          </div>

          <div className="glass-card" style={{padding:'1.75rem'}}>
            {/* Google account info */}
            <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'rgba(34,197,94,0.06)',borderRadius:'10px',border:'1px solid rgba(34,197,94,0.15)',marginBottom:'1.25rem'}}>
              {googleData.avatar && (
                <img src={googleData.avatar} alt="" style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover'}}/>
              )}
              <div>
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
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Role <span style={{color:'#ef4444'}}>*</span>
                  </label>
                  <select value={completionForm.role} onChange={e=>setCompletionForm(p=>({...p,role:e.target.value}))}
                    className="input-field">
                    <option value="junior">Junior (Current Student)</option>
                    <option value="senior">Senior (Alumni)</option>
                  </select>
                </div>

                <div>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Department <span style={{color:'#ef4444'}}>*</span>
                  </label>
                  <select value={completionForm.department} onChange={e=>setCompletionForm(p=>({...p,department:e.target.value}))}
                    className="input-field">
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Batch <span style={{color:'#ef4444'}}>*</span>
                  </label>
                  <input type="text" value={completionForm.batch}
                    onChange={e=>setCompletionForm(p=>({...p,batch:e.target.value}))}
                    className="input-field" placeholder="e.g. 57"/>
                </div>

                <div>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Student ID <span style={{color:'#ef4444'}}>*</span>
                  </label>
                  <input type="text" value={completionForm.studentId}
                    onChange={e=>setCompletionForm(p=>({...p,studentId:e.target.value}))}
                    className="input-field" placeholder="e.g. C241268"/>
                </div>

                <div>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Gender <span style={{color:'#ef4444'}}>*</span>
                  </label>
                  <select value={completionForm.gender} onChange={e=>setCompletionForm(p=>({...p,gender:e.target.value}))}
                    className="input-field">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Blood Group
                  </label>
                  <select value={completionForm.bloodGroup} onChange={e=>setCompletionForm(p=>({...p,bloodGroup:e.target.value}))}
                    className="input-field">
                    <option value="">Select (optional)</option>
                    {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div style={{gridColumn:'1/-1'}}>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    Skills (optional)
                  </label>
                  <input type="text" value={completionForm.skills}
                    onChange={e=>setCompletionForm(p=>({...p,skills:e.target.value}))}
                    className="input-field" placeholder="e.g. React, Python, Figma..."/>
                </div>

                <div style={{gridColumn:'1/-1'}}>
                  <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
                    About Me (optional)
                  </label>
                  <textarea value={completionForm.bio}
                    onChange={e=>setCompletionForm(p=>({...p,bio:e.target.value}))}
                    rows={2} className="input-field" style={{resize:'none'}}
                    placeholder="Tell the community about yourself..."/>
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
                {completing ? (
                  <><div style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/> Creating Account...</>
                ) : <><Check size={16}/> Complete Registration →</>}
              </button>

              <button type="button" onClick={()=>setShowCompletion(false)}
                style={{width:'100%',padding:'0.5rem',marginTop:'0.5rem',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:'0.78rem'}}>
                ← Use a different account
              </button>
            </form>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Login Form ───────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:'#0f150d',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div className="fade-in" style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}>
            <Logo size={56}/>
          </div>
          <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.9rem',fontWeight:800}}>
            Welcome Back
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.82rem',marginTop:'0.35rem'}}>
            Sign in to IIUC MentorBridge
          </p>
        </div>

        <div className="glass-card" style={{padding:'1.875rem'}}>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>

            <div>
              <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Email Address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                className="input-field" placeholder="your@email.com" autoComplete="email" autoFocus/>
            </div>

            <div>
              <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>Password</label>
              <div style={{position:'relative'}}>
                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  className="input-field" placeholder="Your password" autoComplete="current-password"
                  style={{paddingRight:'2.5rem'}}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer'}}>
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              <div style={{textAlign:'right',marginTop:'0.35rem'}}>
                <Link href="/forgot-password" style={{color:'rgba(255,255,255,0.35)',fontSize:'0.75rem',textDecoration:'none',transition:'color 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.color='#22c55e'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.35)'}>
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
              {loading ? (
                <><div style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',margin:'1.25rem 0'}}>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}}/>
            <span style={{color:'rgba(255,255,255,0.25)',fontSize:'0.75rem'}}>OR</span>
            <div style={{flex:1,height:'1px',background:'rgba(255,255,255,0.08)'}}/>
          </div>

          {/* Google Sign In */}
          <button onClick={initGoogleSignIn} style={{
            width:'100%',padding:'0.75rem',borderRadius:'10px',
            background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.12)',
            color:'white',cursor:'pointer',fontSize:'0.875rem',fontWeight:600,
            display:'flex',alignItems:'center',justifyContent:'center',gap:'0.65rem',
            transition:'all 0.2s',fontFamily:'inherit'
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.12)';}}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            Continue with Google
          </button>

          {/* Dev Quick Login — localhost only */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{marginTop:'0.75rem',padding:'0.75rem',background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'10px'}}>
              <p style={{color:'rgba(251,191,36,0.7)',fontSize:'0.72rem',marginBottom:'0.5rem',textAlign:'center'}}>
                ⚡ Dev: Google FedCM localhost এ কাজ করে না — email/password use করো
              </p>
            </div>
          )}

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'0.82rem',marginTop:'1.25rem'}}>
            Don't have an account?{' '}
            <Link href="/register" style={{color:'#22c55e',textDecoration:'none',fontWeight:700}}>
              Register here
            </Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}