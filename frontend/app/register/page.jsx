'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name:'', email:'', password:'', batch:'', department:'',
    role:'junior', studentId:'', bloodGroup:'', bio:'', skills:'', gender:''
  });
  const [isIIUCian, setIsIIUCian] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isIIUCian) { setError('Please confirm you are an IIUCian'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const L = ({children}) => <label style={{color:'rgba(255,255,255,0.6)', fontSize:'0.72rem', fontWeight:600, display:'block', marginBottom:'0.28rem'}}>{children}</label>;

  return (
    <div className="page-bg" style={{padding:'1.5rem 1rem', display:'flex', alignItems:'flex-start', justifyContent:'center', minHeight:'100vh'}}>
      <div className="fade-in" style={{width:'100%', maxWidth:'820px', paddingTop:'1rem', margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'1.25rem'}}>
          <Logo size={36}/>
          <div>
            <h1 className="gradient-text" style={{fontSize:'1.3rem', fontWeight:800}}>Join IIUC MentorBridge</h1>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.75rem'}}>Create your network profile</p>
          </div>
        </div>

        <div className="glass-card" style={{padding:'1.5rem'}}>
          {error && <div className="alert-error" style={{marginBottom:'1rem'}}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Row 1: Name + Role */}
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'0.65rem', marginBottom:'0.65rem'}}>
              <div><L>Full Name *</L><input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="Your full name"/></div>
              <div><L>Role *</L>
                <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                  <option value="junior">Junior (Student)</option>
                  <option value="senior">Senior (Alumni)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Email + Password */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem', marginBottom:'0.65rem'}}>
              <div><L>Email *</L><input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="your@email.com"/></div>
              <div><L>Password *</L><input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="Min 6 characters"/></div>
            </div>

            {/* Row 3: ID + Batch + Dept + Gender + Blood */}
            <div style={{display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr', gap:'0.65rem', marginBottom:'0.65rem'}}>
              <div><L>Student ID</L><input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="input-field" placeholder="C221234"/></div>
              <div><L>Batch</L><input type="text" name="batch" value={formData.batch} onChange={handleChange} className="input-field" placeholder="57"/></div>
              <div><L>Department</L><input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" placeholder="CSE"/></div>
              <div><L>Gender</L>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div><L>Blood Group</L>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field">
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            {/* Row 4: Skills + Bio */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'0.65rem', marginBottom:'0.65rem'}}>
              <div><L>Skills</L><input type="text" name="skills" value={formData.skills} onChange={handleChange} className="input-field" placeholder="React, Node.js, Python..."/></div>
              <div><L>About Me</L><textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field" style={{resize:'none', height:'38px', paddingTop:'0.4rem'}} rows={1} placeholder="Tell others about yourself..."/></div>
            </div>

            {/* IIUC Confirm */}
            <div style={{display:'flex', alignItems:'center', gap:'0.65rem', background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.22)', padding:'0.65rem 0.875rem', borderRadius:'9px', marginBottom:'0.875rem'}}>
              <input type="checkbox" id="iiucian" checked={isIIUCian} onChange={(e) => setIsIIUCian(e.target.checked)} style={{width:'15px', height:'15px', accentColor:'#22c55e', flexShrink:0}}/>
              <label htmlFor="iiucian" style={{fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', cursor:'pointer'}}>
                I confirm that I am an <span style={{color:'#22c55e', fontWeight:700}}>IIUCian</span> 🎓
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{width:'100%', padding:'0.65rem'}}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{textAlign:'center', fontSize:'0.78rem', color:'rgba(255,255,255,0.3)', marginTop:'0.875rem'}}>
            Already have an account? <Link href="/login" style={{color:'#22c55e', fontWeight:600, textDecoration:'none'}}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}