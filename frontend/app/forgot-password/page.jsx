'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOTPChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`fotp-${index + 1}`)?.focus();
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`fotp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return setError('Enter all 6 digits');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-otp`, { email, otp: otpCode });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        email, otp: otp.join(''), newPassword
      });
      setSuccess('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem'}}>
      <div className="fade-in" style={{width:'100%', maxWidth:'400px'}}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}><Logo size={48}/></div>
          <h1 className="gradient-text" style={{fontSize:'1.6rem', fontWeight:800}}>
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'New Password'}
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.35rem'}}>
            {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? `OTP sent to ${email}` : 'Set your new password'}
          </p>
        </div>

        <div className="glass-card" style={{padding:'1.75rem'}}>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.35rem'}}>
                  Email Address
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input-field" placeholder="your@email.com" autoFocus/>
              </div>
              {error && <p style={{color:'#f87171', fontSize:'0.82rem'}}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem'}}>
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div>
              <div style={{display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.5rem'}}>
                {otp.map((digit, i) => (
                  <input key={i} id={`fotp-${i}`} type="text" maxLength={1} value={digit}
                    onChange={e => handleOTPChange(e.target.value, i)}
                    onKeyDown={e => handleOTPKeyDown(e, i)}
                    style={{width:'46px', height:'54px', textAlign:'center', fontSize:'1.4rem', fontWeight:700, background:'rgba(255,255,255,0.06)', border:`2px solid ${digit ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`, borderRadius:'10px', color:'white', outline:'none', transition:'border 0.2s'}}/>
                ))}
              </div>
              {error && <p style={{color:'#f87171', fontSize:'0.82rem', textAlign:'center', marginBottom:'1rem'}}>{error}</p>}
              <button onClick={handleVerifyOTP} disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem', marginBottom:'0.75rem'}}>
                {loading ? 'Verifying...' : <><Check size={15}/> Verify OTP</>}
              </button>
              <button onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); }}
                style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.35)', cursor:'pointer', fontSize:'0.75rem', width:'100%'}}>
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.35rem'}}>
                  New Password
                </label>
                <div style={{position:'relative'}}>
                  <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                    className="input-field" placeholder="Min. 6 characters" style={{paddingRight:'2.5rem'}} autoFocus/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer'}}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'block', marginBottom:'0.35rem'}}>
                  Confirm Password
                </label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                  className="input-field" placeholder="Repeat password"/>
              </div>
              {error && <p style={{color:'#f87171', fontSize:'0.82rem'}}>{error}</p>}
              {success && <p style={{color:'#22c55e', fontSize:'0.82rem', textAlign:'center'}}>{success}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem'}}>
                {loading ? 'Resetting...' : <><Check size={15}/> Reset Password</>}
              </button>
            </form>
          )}

          <div style={{marginTop:'1.25rem', textAlign:'center'}}>
            <Link href="/login" style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'0.3rem'}}>
              <ArrowLeft size={13}/> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}