'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem'}}>
      <div className="fade-in" style={{width:'100%', maxWidth:'380px'}}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}>
            <Logo size={48}/>
          </div>
          <h1 className="gradient-text" style={{fontSize:'1.6rem', fontWeight:800}}>Forgot Password</h1>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.25rem'}}>
            Enter your email to reset your password
          </p>
        </div>

        <div className="glass-card" style={{padding:'1.75rem'}}>
          {!sent ? (
            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'0.875rem'}}>
              <div>
                <label style={{color:'rgba(255,255,255,0.65)', fontSize:'0.75rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem', marginBottom:'0.35rem'}}>
                  <Mail size={12}/> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem'}}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div style={{textAlign:'center', padding:'0.5rem 0'}}>
              <div style={{fontSize:'3rem', marginBottom:'0.75rem'}}>📧</div>
              <h3 style={{color:'#22c55e', fontWeight:700, marginBottom:'0.5rem'}}>Email Sent!</h3>
              <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem', lineHeight:'1.6'}}>
                If an account exists for <span style={{color:'white'}}>{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
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