'use client';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer style={{
      position:'relative',
      overflow:'hidden',
      background:'linear-gradient(135deg, #0a1208 0%, #0f1a0c 50%, #0a1208 100%)',
      borderTop:'1px solid rgba(34,197,94,0.15)',
      marginTop:'auto',
    }}>
      {/* 3D Glow Effects */}
      <div style={{position:'absolute',top:'-60px',left:'10%',width:'300px',height:'300px',background:'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'absolute',top:'-40px',right:'15%',width:'200px',height:'200px',background:'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'absolute',bottom:0,left:'50%',transform:'translateX(-50%)',width:'80%',height:'1px',background:'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)',pointerEvents:'none',zIndex:0}}/>

      <div style={{position:'relative',zIndex:1,maxWidth:'100%',padding:'2.5rem 2rem 1.5rem'}}>

        {/* Top Section */}
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr',gap:'2rem',marginBottom:'2rem'}}>

          {/* Brand */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.65rem',marginBottom:'1rem'}}>
              <div style={{
                width:'40px',height:'40px',borderRadius:'12px',
                background:'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(15,61,46,0.3))',
                border:'1px solid rgba(34,197,94,0.3)',
                display:'flex',alignItems:'center',justifyContent:'center',
                boxShadow:'0 4px 16px rgba(34,197,94,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <Logo size={24}/>
              </div>
              <div>
                <div style={{fontSize:'1rem',fontWeight:800,color:'#22c55e',letterSpacing:'-0.01em',lineHeight:1}}>MentorBridge</div>
                <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',letterSpacing:'0.06em',marginTop:'1px'}}>IIUC Student Hub</div>
              </div>
            </div>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'0.8rem',lineHeight:'1.7',marginBottom:'1rem',maxWidth:'220px'}}>
              Connecting IIUC students and alumni for mentorship, collaboration, and career growth.
            </p>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <a href="https://github.com/ErrorM8" target="_blank" rel="noreferrer"
                style={{
                  width:'32px',height:'32px',borderRadius:'8px',
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:'0.85rem',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.12)';e.currentTarget.style.borderColor='rgba(34,197,94,0.3)';e.currentTarget.style.color='#22c55e';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}>
                ⌥
              </a>
              <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer"
                style={{
                  width:'32px',height:'32px',borderRadius:'8px',
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:'0.85rem',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.12)';e.currentTarget.style.borderColor='rgba(34,197,94,0.3)';e.currentTarget.style.color='#22c55e';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}>
                ƒ
              </a>
              <a href="mailto:islamsakifbul@gmail.com"
                style={{
                  width:'32px',height:'32px',borderRadius:'8px',
                  background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  color:'rgba(255,255,255,0.5)',textDecoration:'none',fontSize:'0.75rem',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.12)';e.currentTarget.style.borderColor='rgba(34,197,94,0.3)';e.currentTarget.style.color='#22c55e';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}>
                @
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <span style={{width:'16px',height:'1px',background:'#22c55e',display:'inline-block'}}/>
              Navigation
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {[
                {href:'/dashboard',label:'Dashboard'},
                {href:'/users',label:'Find Members'},
                {href:'/resources',label:'Resources'},
                {href:'/market',label:'Marketplace'},
                {href:'/blood',label:'Blood Bank'},
                {href:'/chat',label:'AI Mentor'},
              ].map(item => (
                <Link key={item.href} href={item.href} style={{
                  color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',textDecoration:'none',
                  transition:'all 0.2s',display:'flex',alignItems:'center',gap:'0.4rem',
                  padding:'0.15rem 0',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.color='#22c55e';e.currentTarget.style.paddingLeft='0.35rem';}}
                  onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.paddingLeft='0';}}>
                  <span style={{width:'4px',height:'4px',borderRadius:'50%',background:'rgba(34,197,94,0.4)',display:'inline-block',flexShrink:0}}/>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* External */}
          <div>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <span style={{width:'16px',height:'1px',background:'#22c55e',display:'inline-block'}}/>
              IIUC Links
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              {[
                {href:'https://www.iiuc.ac.bd/web/news',label:'IIUC News'},
                {href:'https://transport.iiuc.ac.bd/',label:'IIUC Transport'},
                {href:'https://iiuccoverpage.vercel.app/',label:'Cover Page Generator'},
                {href:'https://www.iiuc.ac.bd/',label:'IIUC Official Site'},
              ].map(item => (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer" style={{
                  color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',textDecoration:'none',
                  transition:'all 0.2s',display:'flex',alignItems:'center',gap:'0.4rem',
                  padding:'0.15rem 0',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.color='#22c55e';e.currentTarget.style.paddingLeft='0.35rem';}}
                  onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.paddingLeft='0';}}>
                  <span style={{width:'4px',height:'4px',borderRadius:'50%',background:'rgba(34,197,94,0.4)',display:'inline-block',flexShrink:0}}/>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.875rem',display:'flex',alignItems:'center',gap:'0.4rem'}}>
              <span style={{width:'16px',height:'1px',background:'#22c55e',display:'inline-block'}}/>
              Developer
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {[
                {name:'Sakibul Islam Sakif',id:'C241268',role:'Dept. of CSE, IIUC'},
                // {name:'Musfek Uddin',id:'C241265',role:'Frontend · UI/UX'},
                // {name:'Mohammad Akil',id:'C241272',role:'Full-Stack Support'},
              ].map((m,i) => (
                <div key={i} style={{
                  padding:'0.6rem 0.75rem',borderRadius:'10px',
                  background:'rgba(34,197,94,0.04)',border:'1px solid rgba(34,197,94,0.1)',
                  transition:'all 0.2s'
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(34,197,94,0.08)';e.currentTarget.style.borderColor='rgba(34,197,94,0.2)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(34,197,94,0.04)';e.currentTarget.style.borderColor='rgba(34,197,94,0.1)';}}>
                  <p style={{color:'rgba(255,255,255,0.8)',fontWeight:600,fontSize:'0.78rem'}}>{m.name}</p>
                  <p style={{color:'#22c55e',fontSize:'0.68rem',fontWeight:600,marginTop:'0.1rem'}}>{m.id}</p>
                  <p style={{color:'rgba(255,255,255,0.35)',fontSize:'0.7rem',marginTop:'0.1rem'}}>{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:'1px',background:'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), rgba(34,197,94,0.2), transparent)',marginBottom:'1.25rem'}}/>

        {/* Bottom Bar */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px rgba(34,197,94,0.6)'}}/>
            <p style={{color:'rgba(255,255,255,0.25)',fontSize:'0.73rem'}}>
              © 2026 IIUC MentorBridge
            </p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <span style={{color:'rgba(255,255,255,0.15)',fontSize:'0.7rem'}}> IIUC · Chittagong</span>
            <div style={{
              padding:'0.25rem 0.65rem',borderRadius:'999px',
              background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',
            }}>
              {/* <span style={{color:'#22c55e',fontSize:'0.68rem',fontWeight:700}}>v2.0 ✦</span> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}