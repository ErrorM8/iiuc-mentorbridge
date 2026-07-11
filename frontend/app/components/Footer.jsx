import Link from 'next/link';
import { Mail, Globe, Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer py-8 px-4">
      <div className="center-wrap">
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'2rem', marginBottom:'1.5rem'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem'}}>
              <Logo size={28}/>
              <div>
                <div style={{fontSize:'0.9rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
                <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.4)'}}>MentorBridge</div>
              </div>
            </div>
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem', lineHeight:'1.65'}}>Connecting IIUC students and alumni for mentorship and career growth.</p>
          </div>

          <div>
            <h4 style={{color:'rgba(255,255,255,0.7)', fontWeight:700, marginBottom:'0.65rem', fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>Navigation</h4>
            <div style={{display:'flex', flexDirection:'column', gap:'0.45rem'}}>
              <Link href="/about" className="footer-link"><Globe size={13}/> About Us</Link>
              <Link href="/users" className="footer-link"><Globe size={13}/> Find Members</Link>
              <Link href="/chat" className="footer-link"><Globe size={13}/> AI Mentor</Link>
              <Link href="/settings" className="footer-link"><Globe size={13}/> Settings</Link>
              <a href="https://iiuccoverpage.vercel.app/" target="_blank" rel="noreferrer" className="footer-link"><Globe size={13}/> Cover Page Generator</a>
              <a href="https://transport.iiuc.ac.bd/" target="_blank" rel="noreferrer" className="footer-link"><Globe size={13}/> Transport</a>
            </div>
          </div>

          <div>
            <h4 style={{color:'rgba(255,255,255,0.7)', fontWeight:700, marginBottom:'0.65rem', fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>Developer</h4>
            <div style={{display:'flex', flexDirection:'column', gap:'0.45rem'}}>
              <span style={{color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', fontWeight:600}}>Sakibul Islam Sakif</span>
              <span style={{color:'rgba(255,255,255,0.35)', fontSize:'0.78rem'}}>IIUC • CSE Department</span>
              <a href="mailto:islamsakifbul@gmail.com" className="footer-link" style={{fontSize:'0.78rem'}}>
                <Mail size={13}/> islamsakifbul@gmail.com
              </a>
              <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" className="footer-link" style={{fontSize:'0.78rem'}}>
                <Globe size={13}/> facebook.com/sakibul.sakif
              </a>
            </div>
          </div>
        </div>

        <div className="divider"/>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem'}}>
          <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem'}}>© 2026 IIUC MentorBridge — All rights reserved</p>
          <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.3rem'}}>
            Developed by <span style={{color:'#22c55e', fontWeight:600}}>Sakibul Islam Sakif</span>
          </p>
        </div>
      </div>
    </footer>
  );
}