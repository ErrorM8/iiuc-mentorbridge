import Link from 'next/link';
import { Mail, Users, Bot, Briefcase, Network, Globe } from 'lucide-react';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="page-bg">
      <nav className="navbar">
        <div className="center-wrap" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.65rem 1.5rem'}}>
          <Link href="/" style={{display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none'}}>
            <Logo size={32}/>
            <div>
              <div style={{fontSize:'0.9rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
              <div style={{fontSize:'0.62rem', color:'rgba(255,255,255,0.4)'}}>MentorBridge</div>
            </div>
          </Link>
          <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
            <Link href="/login" className="nav-link" style={{fontSize:'0.85rem'}}>Login</Link>
            <Link href="/register" className="btn-primary" style={{padding:'0.45rem 1.1rem', fontSize:'0.82rem'}}>Join Now</Link>
          </div>
        </div>
      </nav>

      <div className="center-wrap" style={{flex:1, paddingTop:'2rem', paddingBottom:'3rem'}}>
        {/* Hero */}
        <div style={{textAlign:'center', marginBottom:'2.5rem'}} className="fade-in">
          <div style={{display:'flex', justifyContent:'center', marginBottom:'1rem'}}>
            <Logo size={64}/>
          </div>
          <h1 className="gradient-text" style={{fontSize:'2.2rem', fontWeight:800, marginBottom:'0.5rem'}}>IIUC MentorBridge</h1>
          <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.95rem', maxWidth:'500px', margin:'0 auto'}}>
            Connecting IIUC students with alumni for mentorship, career guidance, and lifelong networking.
          </p>
          <Link href="/register" className="btn-primary" style={{display:'inline-flex', marginTop:'1.25rem', padding:'0.65rem 1.75rem'}}>
            Get Started →
          </Link>
        </div>

        {/* Mission Cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'0.75rem', marginBottom:'2rem'}}>
          {[
            { icon: Users, title:'Our Mission', desc:'Bridge the gap between students and successful alumni to foster a culture of mentorship.' },
            { icon: Network, title:'Our Vision', desc:'Build the largest IIUC alumni-student network where every student has access to a mentor.' },
            { icon: Briefcase, title:'Our Values', desc:'Community, integrity, and collaboration. We believe in giving back and lifting others.' },
          ].map((item) => (
            <div key={item.title} className="glass-card" style={{padding:'1.25rem', textAlign:'center'}}>
              <div style={{width:'40px', height:'40px', borderRadius:'10px', background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem'}}>
                <item.icon size={18} color="#22c55e"/>
              </div>
              <h3 style={{fontWeight:700, color:'white', fontSize:'0.9rem', marginBottom:'0.4rem'}}>{item.title}</h3>
              <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', lineHeight:'1.6'}}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="post-card" style={{marginBottom:'1.5rem'}}>
          <h2 style={{fontWeight:700, color:'#22c55e', fontSize:'1rem', marginBottom:'1rem'}}>What We Offer</h2>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'0.65rem'}}>
            {[
              { icon: Users, title:'Senior-Junior Network', desc:'Connect with seniors in your field.' },
              { icon: Bot, title:'AI Career Mentor', desc:'Get instant career guidance from AI.' },
              { icon: Briefcase, title:'Job & Internship Tips', desc:'Learn from those who have been there.' },
              { icon: Network, title:'Professional Connections', desc:'Build your network before you graduate.' },
            ].map((item) => (
              <div key={item.title} style={{display:'flex', gap:'0.65rem', padding:'0.65rem', borderRadius:'10px', background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.14)'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'8px', background:'rgba(34,197,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  <item.icon size={15} color="#22c55e"/>
                </div>
                <div>
                  <h4 style={{fontWeight:600, color:'rgba(255,255,255,0.85)', fontSize:'0.8rem'}}>{item.title}</h4>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.72rem'}}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Info */}
        <div className="post-card" style={{marginBottom:'1.5rem'}}>
          <h2 style={{fontWeight:700, color:'#22c55e', fontSize:'1rem', marginBottom:'1rem'}}>About the Developer</h2>
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <div className="avatar" style={{width:'56px', height:'56px', fontSize:'1.4rem', borderRadius:'14px', flexShrink:0}}>S</div>
            <div>
              <h3 style={{fontWeight:700, color:'white', fontSize:'0.95rem'}}>Sakibul Islam Sakif</h3>
              <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.78rem'}}>IIUC • CSE Department</p>
              <div style={{display:'flex', gap:'0.75rem', marginTop:'0.5rem', flexWrap:'wrap'}}>
                <a href="mailto:islamsakifbul@gmail.com" style={{display:'flex', alignItems:'center', gap:'0.3rem', color:'#22c55e', fontSize:'0.78rem', textDecoration:'none'}}>
                  <Mail size={13}/> islamsakifbul@gmail.com
                </a>
                <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:'0.3rem', color:'#22c55e', fontSize:'0.78rem', textDecoration:'none'}}>
                  <Globe size={13}/> facebook.com/sakibul.sakif
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="post-card">
          <h2 style={{fontWeight:700, color:'#22c55e', fontSize:'1rem', marginBottom:'1rem'}}>Contact</h2>
          <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
            <a href="mailto:islamsakifbul@gmail.com" style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'rgba(255,255,255,0.55)', fontSize:'0.82rem', textDecoration:'none'}}>
              <Mail size={14} color="#22c55e"/> islamsakifbul@gmail.com
            </a>
            <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'rgba(255,255,255,0.55)', fontSize:'0.82rem', textDecoration:'none'}}>
              <Globe size={14} color="#22c55e"/> facebook.com/sakibul.sakif
            </a>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}