'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import Logo from '../components/Logo';

const DEPARTMENTS = [
  'CSE','CCE','EEE','ETE','Civil Engineering','Pharmacy',
  'BBA','MBA','English','Arabic','LIS','Law',
  'Economics & Banking','QSIS','DIS','SHIS'
];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const [formData, setFormData] = useState({
    name:'', email:'', password:'', confirmPassword:'',
    batch:'', department:'', role:'junior',
    studentId:'', bloodGroup:'', gender:'male',
    bio:'', skills:'', isIIUCian: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type==='checkbox'?checked:value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]:'' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.batch.trim()) errors.batch = 'Batch is required';
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.isIIUCian) errors.isIIUCian = 'You must confirm you are an IIUCian';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);
      setRegisteredEmail(res.data.email || formData.email);
      if (res.data.needsVerification) {
        setStep(2);
      } else if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        router.push('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const errCode = err.response?.data?.error;
      if (errCode === 'EMAIL_NOT_CONFIGURED') {
        setError('Email service is currently unavailable. Registration requires email verification. Please contact admin.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  };

  const handleOTPChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index+1}`)?.focus();
  };

  const handleOTPKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index-1}`)?.focus();
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
      const msg = err.response?.data?.message || 'Invalid OTP';
      setOtpError(msg);
      if (err.response?.data?.expired) {
        setOtpError('OTP expired. Please go back and register again.');
      }
    } finally { setOtpLoading(false); }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        ...formData, email: registeredEmail
      });
      setResendMsg('New OTP sent! Check your email.');
      setOtp(['','','','','','']);
      setOtpError('');
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setResending(false); }
  };

  const FieldError = ({ field }) => fieldErrors[field] ? (
    <p style={{color:'#f87171',fontSize:'0.72rem',marginTop:'0.25rem',display:'flex',alignItems:'center',gap:'0.25rem'}}>
      <AlertCircle size={11}/> {fieldErrors[field]}
    </p>
  ) : null;

  const L = ({ children, required }) => (
    <label style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',fontWeight:600,display:'block',marginBottom:'0.3rem'}}>
      {children} {required && <span style={{color:'#ef4444'}}>*</span>}
    </label>
  );

  // ========= OTP STEP =========
  if (step === 2) {
    return (
      <div style={{minHeight:'100vh',background:'#0f150d',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
        <div className="fade-in" style={{width:'100%',maxWidth:'420px'}}>
          <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:'1rem'}}>
              <Logo size={52}/>
            </div>
            <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.6rem',fontWeight:800}}>
              Verify Your Email
            </h1>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',marginTop:'0.4rem'}}>OTP sent to</p>
            <p style={{color:'#22c55e',fontWeight:700,fontSize:'0.95rem'}}>{registeredEmail}</p>
          </div>

          <div className="glass-card" style={{padding:'2rem'}}>
            {/* Email icon */}
            <div style={{textAlign:'center',marginBottom:'1.25rem'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'14px',background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>
                <Mail size={26} color="#22c55e"/>
              </div>
              <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.82rem',marginTop:'0.75rem',lineHeight:'1.5'}}>
                Check your inbox for the 6-digit verification code
              </p>
            </div>

            {/* OTP Inputs */}
            <div style={{display:'flex',gap:'0.5rem',justifyContent:'center',marginBottom:'1.25rem'}}>
              {otp.map((digit, i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                  onChange={e=>handleOTPChange(e.target.value, i)}
                  onKeyDown={e=>handleOTPKeyDown(e, i)}
                  style={{
                    width:'46px',height:'56px',textAlign:'center',
                    fontSize:'1.5rem',fontWeight:800,
                    background:digit?'rgba(34,197,94,0.08)':'rgba(255,255,255,0.05)',
                    border:`2px solid ${digit?'rgba(34,197,94,0.6)':'rgba(255,255,255,0.12)'}`,
                    borderRadius:'12px',color:'white',outline:'none',
                    transition:'all 0.2s',caretColor:'#22c55e'
                  }}/>
              ))}
            </div>

            {otpError && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'0.6rem 0.875rem',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
                <AlertCircle size={14} color="#f87171"/>
                <p style={{color:'#f87171',fontSize:'0.82rem'}}>{otpError}</p>
              </div>
            )}

            {resendMsg && (
              <div style={{background:resendMsg.includes('sent')?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${resendMsg.includes('sent')?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'}`,borderRadius:'8px',padding:'0.6rem 0.875rem',marginBottom:'1rem'}}>
                <p style={{color:resendMsg.includes('sent')?'#22c55e':'#f87171',fontSize:'0.82rem'}}>{resendMsg}</p>
              </div>
            )}

            <button onClick={handleVerify} disabled={otpLoading||otp.join('').length!==6}
              className="btn-primary"
              style={{width:'100%',padding:'0.8rem',fontSize:'0.9rem',marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
              {otpLoading ? (
                <><div style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/> Verifying...</>
              ) : <><Check size={16}/> Verify & Create Account</>}
            </button>

            <div style={{textAlign:'center',display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.78rem'}}>
                Didn't receive it?{' '}
                <button onClick={handleResend} disabled={resending}
                  style={{background:'transparent',border:'none',color:'#22c55e',cursor:'pointer',fontSize:'0.78rem',fontWeight:600}}>
                  {resending?'Sending...':'Resend OTP'}
                </button>
              </p>
              <button onClick={()=>setStep(1)}
                style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.25)',cursor:'pointer',fontSize:'0.75rem'}}>
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ========= REGISTRATION FORM =========
  return (
    <div style={{minHeight:'100vh',background:'#0f150d',padding:'1.5rem 1rem 2rem',display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
      <div className="fade-in" style={{width:'100%',maxWidth:'860px',paddingTop:'1rem',margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'0.875rem'}}>
            <Logo size={52}/>
          </div>
          <h1 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",background:'linear-gradient(135deg,#22c55e,#86efac)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:'1.9rem',fontWeight:800}}>
            Join MentorBridge
          </h1>
          <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.8rem',marginTop:'0.35rem'}}>
            Exclusively for IIUC Students & Alumni • Email verification required
          </p>
        </div>

        <div className="glass-card" style={{padding:'1.875rem'}}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'0.875rem'}}>

              {/* Name */}
              <div style={{gridColumn:'1/-1'}}>
                <L required>Full Name</L>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="input-field" placeholder="Your full name"
                  style={{borderColor:fieldErrors.name?'rgba(239,68,68,0.5)':undefined}}/>
                <FieldError field="name"/>
              </div>

              {/* Email */}
              <div style={{gridColumn:'1/-1'}}>
                <L required>Email Address</L>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="input-field" placeholder="your@email.com"
                  style={{borderColor:fieldErrors.email?'rgba(239,68,68,0.5)':undefined}}/>
                <FieldError field="email"/>
                <p style={{color:'rgba(255,255,255,0.25)',fontSize:'0.7rem',marginTop:'0.2rem',display:'flex',alignItems:'center',gap:'0.3rem'}}>
                  <Mail size={11} color="#22c55e"/> A verification OTP will be sent to this email — required to activate your account
                </p>
              </div>

              {/* Password */}
              <div>
                <L required>Password</L>
                <div style={{position:'relative'}}>
                  <input type={showPass?'text':'password'} name="password" value={formData.password} onChange={handleChange}
                    className="input-field" placeholder="Min. 6 characters"
                    style={{paddingRight:'2.5rem',borderColor:fieldErrors.password?'rgba(239,68,68,0.5)':undefined}}/>
                  <button type="button" onClick={()=>setShowPass(!showPass)}
                    style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer'}}>
                    {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
                <FieldError field="password"/>
              </div>

              {/* Confirm Password */}
              <div>
                <L required>Confirm Password</L>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="input-field" placeholder="Repeat password"
                  style={{borderColor:fieldErrors.confirmPassword?'rgba(239,68,68,0.5)':undefined}}/>
                <FieldError field="confirmPassword"/>
              </div>

              {/* Role */}
              <div>
                <L required>Role</L>
                <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                  <option value="junior">Junior (Current Student)</option>
                  <option value="senior">Senior (Alumni)</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <L required>Department</L>
                <select name="department" value={formData.department} onChange={handleChange} className="input-field"
                  style={{borderColor:fieldErrors.department?'rgba(239,68,68,0.5)':undefined}}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
                <FieldError field="department"/>
              </div>

              {/* Batch */}
              <div>
                <L required>Batch</L>
                <input type="text" name="batch" value={formData.batch} onChange={handleChange}
                  className="input-field" placeholder="e.g. 57"
                  style={{borderColor:fieldErrors.batch?'rgba(239,68,68,0.5)':undefined}}/>
                <FieldError field="batch"/>
              </div>

              {/* Student ID */}
              <div>
                <L required>Student ID</L>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange}
                  className="input-field" placeholder="e.g. C241268"
                  style={{borderColor:fieldErrors.studentId?'rgba(239,68,68,0.5)':undefined}}/>
                <FieldError field="studentId"/>
              </div>

              {/* Gender */}
              <div>
                <L required>Gender</L>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Blood Group */}
              <div>
                <L required>Blood Group</L>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
                  <option value="">Select (optional)</option>
                  {BLOOD_GROUPS.map(bg=><option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              {/* Skills */}
              <div style={{gridColumn:'1/-1'}}>
                <L>Skills</L>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange}
                  className="input-field" placeholder="e.g. React, Python, Figma, UI/UX..."/>
              </div>

              {/* Bio */}
              <div style={{gridColumn:'1/-1'}}>
                <L>About Me</L>
                <textarea name="bio" value={formData.bio} onChange={handleChange}
                  rows={2} className="input-field" style={{resize:'none'}}
                  placeholder="Tell the community about yourself..."/>
              </div>

              {/* IIUCian Confirmation */}
              <div style={{gridColumn:'1/-1'}}>
                <div onClick={()=>{setFormData(p=>({...p,isIIUCian:!p.isIIUCian}));setFieldErrors(p=>({...p,isIIUCian:''}));}}
                  style={{
                    display:'flex',alignItems:'flex-start',gap:'0.75rem',cursor:'pointer',
                    padding:'0.875rem',
                    background:fieldErrors.isIIUCian?'rgba(239,68,68,0.05)':'rgba(34,197,94,0.05)',
                    borderRadius:'12px',
                    border:`1px solid ${fieldErrors.isIIUCian?'rgba(239,68,68,0.25)':'rgba(34,197,94,0.15)'}`,
                    transition:'all 0.2s'
                  }}>
                  <div style={{
                    width:'20px',height:'20px',borderRadius:'6px',flexShrink:0,marginTop:'1px',
                    border:`2px solid ${formData.isIIUCian?'#22c55e':fieldErrors.isIIUCian?'#ef4444':'rgba(255,255,255,0.25)'}`,
                    background:formData.isIIUCian?'#22c55e':'transparent',
                    display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'
                  }}>
                    {formData.isIIUCian && <Check size={12} color="white"/>}
                  </div>
                  <span style={{color:'rgba(255,255,255,0.7)',fontSize:'0.83rem',lineHeight:'1.55'}}>
                    I confirm that I am a current student or alumni of{' '}
                    <span style={{color:'#22c55e',fontWeight:700}}>International Islamic University Chittagong (IIUC)</span>.
                    This platform is exclusively for IIUCians.
                  </span>
                </div>
                <FieldError field="isIIUCian"/>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'10px',padding:'0.875rem 1rem',marginTop:'0.875rem',display:'flex',alignItems:'flex-start',gap:'0.5rem'}}>
                <AlertCircle size={16} color="#f87171" style={{flexShrink:0,marginTop:'1px'}}/>
                <p style={{color:'#f87171',fontSize:'0.85rem',lineHeight:'1.5'}}>{error}</p>
              </div>
            )}

            {Object.keys(fieldErrors).filter(k=>fieldErrors[k]).length > 0 && (
              <div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'10px',padding:'0.75rem 1rem',marginTop:'0.875rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <AlertCircle size={16} color="#f87171"/>
                <p style={{color:'#f87171',fontSize:'0.82rem'}}>Please fill in all required fields correctly</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary"
              style={{width:'100%',padding:'0.8rem',fontSize:'0.92rem',marginTop:'1.125rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}>
              {loading ? (
                <><div style={{width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/> Creating Account...</>
              ) : <><Mail size={16}/> Create Account & Verify Email →</>}
            </button>
          </form>

          <p style={{textAlign:'center',color:'rgba(255,255,255,0.35)',fontSize:'0.82rem',marginTop:'1.25rem'}}>
            Already have an account?{' '}
            <Link href="/login" style={{color:'#22c55e',textDecoration:'none',fontWeight:700}}>Login</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}