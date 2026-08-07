'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from '../components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setNeedsVerification(true);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        credential: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push(res.data.isNewUser ? '/profile' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed');
    }
  };

  const handleOTPChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return setOtpError('Please enter the 6-digit OTP');
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, { email, otp: otpCode });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally { setOtpLoading(false); }
  };

  // OTP Step
  if (needsVerification) {
    return (
      <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem'}}>
        <div className="fade-in" style={{width:'100%', maxWidth:'400px'}}>
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}><Logo size={48}/></div>
            <h1 className="gradient-text" style={{fontSize:'1.6rem', fontWeight:800}}>Verify Your Email</h1>
            <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem', marginTop:'0.35rem'}}>Enter the OTP sent to</p>
            <p style={{color:'#22c55e', fontWeight:600, fontSize:'0.9rem'}}>{email}</p>
          </div>
          <div className="glass-card" style={{padding:'2rem'}}>
            <div style={{display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.5rem'}}>
              {otp.map((digit, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                  onChange={e => handleOTPChange(e.target.value, i)}
                  onKeyDown={e => handleOTPKeyDown(e, i)}
                  style={{width:'46px', height:'54px', textAlign:'center', fontSize:'1.4rem', fontWeight:700, background:'rgba(255,255,255,0.06)', border:`2px solid ${digit ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius:'10px', color:'white', outline:'none', transition:'border 0.2s'}}/>
              ))}
            </div>
            {otpError && <p style={{color:'#f87171', fontSize:'0.8rem', textAlign:'center', marginBottom:'1rem'}}>{otpError}</p>}
            <button onClick={handleVerify} disabled={otpLoading} className="btn-primary"
              style={{width:'100%', padding:'0.75rem', fontSize:'0.9rem', marginBottom:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem'}}>
              {otpLoading ? 'Verifying...' : <><Check size={16}/> Verify & Login</>}
            </button>
            <div style={{textAlign:'center'}}>
              <button onClick={() => setNeedsVerification(false)}
                style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'0.75rem'}}>
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Login
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem', minHeight:'100vh'}}>
        <div className="fade-in" style={{width:'100%', maxWidth:'400px'}}>

          {/* Logo & Title */}
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}><Logo size={52}/></div>
            <h1 className="gradient-text" style={{fontSize:'1.8rem', fontWeight:800, lineHeight:1.2}}>IIUC MentorBridge</h1>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.35rem'}}>Senior-Junior Network</p>
          </div>

          <div className="glass-card" style={{padding:'1.75rem'}}>

            {/* Email Login Form */}
            <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.35rem'}}>
                  Email Address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field" placeholder="your@email.com"/>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.35rem'}}>
                  Password
                </label>
                <div style={{position:'relative'}}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    className="input-field" placeholder="Your password" style={{paddingRight:'2.5rem'}}/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer'}}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <div style={{textAlign:'right', marginTop:'-0.25rem'}}>
                <Link href="/forgot-password" style={{color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', textDecoration:'none'}}>
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'0.6rem 0.875rem'}}>
                  <p style={{color:'#f87171', fontSize:'0.82rem'}}>{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary"
                style={{width:'100%', padding:'0.65rem', fontSize:'0.9rem'}}>
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{display:'flex', alignItems:'center', gap:'0.75rem', margin:'1.25rem 0'}}>
              <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.1)'}}/>
              <span style={{color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', whiteSpace:'nowrap'}}>or continue with</span>
              <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.1)'}}/>
            </div>

            {/* Google Button */}
            <div style={{
              borderRadius:'10px', overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.1)',
              background:'white',
              display:'flex', alignItems:'center', justifyContent:'center',
              minHeight:'44px'
            }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed. Please try again.')}
                width="358"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
                theme="outline"
                size="large"
              />
            </div>

            <p style={{textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginTop:'1.25rem'}}>
              Don't have an account?{' '}
              <Link href="/register" style={{color:'#22c55e', textDecoration:'none', fontWeight:600}}>Join Now</Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}