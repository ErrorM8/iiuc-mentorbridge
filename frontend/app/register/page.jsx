'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const DEPARTMENTS = [
  'CSE', 'CCE', 'EEE', 'ETE', 'Civil Engineering', 'Pharmacy',
  'BBA', 'MBA', 'English', 'Arabic', 'LIS', 'Law', 'Economics & Banking',
  'QSIS', 'DIS', 'SHIS'
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: form, 2: otp
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    batch: '', department: '', role: 'junior',
    studentId: '', bloodGroup: '', gender: 'male',
    bio: '', skills: '', isIIUCian: false
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.isIIUCian) return setError('You must confirm that you are an IIUCian');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);
      setRegisteredEmail(res.data.email || formData.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleOTPChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        email: registeredEmail, otp: otpCode
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid OTP');
    } finally { setOtpLoading(false); }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { ...formData });
      setOtpError('');
      setOtp(['', '', '', '', '', '']);
      alert('OTP resent!');
    } catch (err) { setOtpError('Failed to resend OTP'); }
  };

  const L = ({ children }) => (
    <label style={{color:'rgba(255,255,255,0.55)', fontSize:'0.72rem', fontWeight:600, display:'block', marginBottom:'0.28rem'}}>
      {children}
    </label>
  );

  // OTP Step
  if (step === 2) {
    return (
      <div className="page-bg" style={{alignItems:'center', justifyContent:'center', display:'flex', padding:'1rem'}}>
        <div className="fade-in" style={{width:'100%', maxWidth:'400px'}}>
          <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}><Logo size={48}/></div>
            <h1 className="gradient-text" style={{fontSize:'1.6rem', fontWeight:800}}>Verify Your Email</h1>
            <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.82rem', marginTop:'0.35rem'}}>
              We sent a 6-digit OTP to
            </p>
            <p style={{color:'#22c55e', fontWeight:600, fontSize:'0.9rem'}}>{registeredEmail}</p>
          </div>

          <div className="glass-card" style={{padding:'2rem'}}>
            <div style={{display:'flex', gap:'0.5rem', justifyContent:'center', marginBottom:'1.5rem'}}>
              {otp.map((digit, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                  onChange={e => handleOTPChange(e.target.value, i)}
                  onKeyDown={e => handleOTPKeyDown(e, i)}
                  style={{
                    width:'46px', height:'54px', textAlign:'center', fontSize:'1.4rem', fontWeight:700,
                    background:'rgba(255,255,255,0.06)', border:`2px solid ${digit ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    borderRadius:'10px', color:'white', outline:'none', transition:'border 0.2s'
                  }}/>
              ))}
            </div>

            {otpError && (
              <p style={{color:'#f87171', fontSize:'0.8rem', textAlign:'center', marginBottom:'1rem'}}>{otpError}</p>
            )}

            <button onClick={handleVerify} disabled={otpLoading} className="btn-primary"
              style={{width:'100%', padding:'0.75rem', fontSize:'0.9rem', marginBottom:'1rem'}}>
              {otpLoading ? 'Verifying...' : <><Check size={16}/> Verify & Continue</>}
            </button>

            <div style={{textAlign:'center'}}>
              <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem'}}>
                Didn't receive the OTP?{' '}
                <button onClick={handleResendOTP}
                  style={{background:'transparent', border:'none', color:'#22c55e', cursor:'pointer', fontSize:'0.78rem', fontWeight:600}}>
                  Resend OTP
                </button>
              </p>
              <button onClick={() => setStep(1)}
                style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'0.75rem', marginTop:'0.5rem'}}>
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="page-bg" style={{padding:'1.5rem 1rem', display:'flex', alignItems:'flex-start', justifyContent:'center', minHeight:'100vh'}}>
      <div className="fade-in" style={{width:'100%', maxWidth:'820px', paddingTop:'1rem', margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:'1.5rem'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom:'0.75rem'}}><Logo size={48}/></div>
          <h1 className="gradient-text" style={{fontSize:'1.8rem', fontWeight:800}}>Join MentorBridge</h1>
          <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', marginTop:'0.35rem'}}>
            Exclusively for IIUC Students & Alumni
          </p>
        </div>

        <div className="glass-card" style={{padding:'1.75rem'}}>
          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'0.75rem'}}>

              {/* Name */}
              <div style={{gridColumn:'1/-1'}}>
                <L>Full Name *</L>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Your full name"/>
              </div>

              {/* Email */}
              <div style={{gridColumn:'1/-1'}}>
                <L>Email Address *</L>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="your@email.com"/>
                <p style={{color:'rgba(255,255,255,0.25)', fontSize:'0.7rem', marginTop:'0.2rem'}}>A verification OTP will be sent to this email</p>
              </div>

              {/* Password */}
              <div>
                <L>Password *</L>
                <div style={{position:'relative'}}>
                  <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="Min. 6 characters" style={{paddingRight:'2.5rem'}}/>
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer'}}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <L>Confirm Password *</L>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input-field" placeholder="Repeat password"/>
              </div>

              {/* Role */}
              <div>
                <L>Role *</L>
                <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                  <option value="junior">Junior (Current Student)</option>
                  <option value="senior">Senior (Alumni)</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <L>Department *</L>
                <select name="department" value={formData.department} onChange={handleChange} required className="input-field">
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Batch */}
              <div>
                <L>Batch *</L>
                <input type="text" name="batch" value={formData.batch} onChange={handleChange} required className="input-field" placeholder="e.g. 57"/>
              </div>

              {/* Gender */}
              <div>
                <L>Gender</L>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Student ID */}
              <div>
                <L>Student ID</L>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="input-field" placeholder="e.g. C241268"/>
              </div>

              {/* Blood Group */}
              <div>
                <L>Blood Group</L>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div style={{gridColumn:'1/-1'}}>
                <L>Skills</L>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="e.g. React, Python, Figma..."/>
              </div>

              {/* Bio */}
              <div style={{gridColumn:'1/-1'}}>
                <L>About Me</L>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} className="input-field" style={{resize:'none'}} placeholder="Tell the community about yourself..."/>
              </div>

              {/* IIUCian Checkbox */}
              <div style={{gridColumn:'1/-1'}}>
                <label style={{display:'flex', alignItems:'flex-start', gap:'0.65rem', cursor:'pointer', padding:'0.75rem', background:'rgba(34,197,94,0.05)', borderRadius:'10px', border:'1px solid rgba(34,197,94,0.15)'}}>
                  <div onClick={() => setFormData(prev => ({...prev, isIIUCian: !prev.isIIUCian}))}
                    style={{width:'20px', height:'20px', borderRadius:'5px', border:`2px solid ${formData.isIIUCian ? '#22c55e' : 'rgba(255,255,255,0.25)'}`, background: formData.isIIUCian ? '#22c55e' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', marginTop:'1px'}}>
                    {formData.isIIUCian && <Check size={12} color="white"/>}
                  </div>
                  <span style={{color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', lineHeight:'1.5'}}>
                    I confirm that I am a current student or alumni of <span style={{color:'#22c55e', fontWeight:600}}>International Islamic University Chittagong (IIUC)</span>. This platform is exclusively for IIUCians.
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'0.65rem 0.875rem', marginTop:'0.875rem'}}>
                <p style={{color:'#f87171', fontSize:'0.82rem'}}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{width:'100%', padding:'0.75rem', fontSize:'0.9rem', marginTop:'1rem'}}>
              {loading ? 'Creating Account...' : 'Create Account & Verify Email →'}
            </button>
          </form>

          <p style={{textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', marginTop:'1.25rem'}}>
            Already have an account?{' '}
            <Link href="/login" style={{color:'#22c55e', textDecoration:'none', fontWeight:600}}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}