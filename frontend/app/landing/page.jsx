'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [visible, setVisible] = useState({});
  const sectionsRef = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => { window.removeEventListener('scroll', handleScroll); observer.disconnect(); };
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveNav(id);
  };

  const features = [
    { icon: '🤝', title: 'Senior-Junior Network', desc: 'Connect with IIUC seniors and alumni who have walked your path. Get real guidance from people who understand your journey.' },
    { icon: '🤖', title: 'AI Career Mentor', desc: 'Powered by LLaMA 3.3 70B. Get instant career advice, internship tips, and study guidance — available 24/7.' },
    { icon: '📚', title: 'Smart Resources', desc: 'Upload study materials, past papers, and notes. AI automatically analyzes PDFs and creates summaries for easier studying.' },
    { icon: '💬', title: 'Real-time Messaging', desc: 'Chat directly with your connections. Build meaningful relationships beyond just online interactions.' },
    { icon: '📢', title: 'Community Feed', desc: 'Share experiences, ask questions, like and comment on posts. Stay connected with the IIUC community.' },
    { icon: '🔔', title: 'Smart Notifications', desc: 'Never miss a connection request or important update. Stay informed about your network activity.' },
  ];

  const steps = [
    { step: '01', title: 'Create Your Profile', desc: 'Sign up as an IIUCian. Add your department, batch, skills, and what you are looking for.' },
    { step: '02', title: 'Find & Connect', desc: 'Browse seniors by department and batch. Send connection requests to mentors who match your goals.' },
    { step: '03', title: 'Learn & Grow', desc: 'Chat with mentors, access shared resources, use AI guidance, and accelerate your career journey.' },
  ];

  const testimonials = [
    { name: 'Rahel Ahmed', batch: 'Batch 52', dept: 'CSE', text: 'MentorBridge connected me with a senior who guided me to my first internship at a top tech company. This platform changed my career trajectory completely!', avatar: 'R' },
    { name: 'Fatema Khanam', batch: 'Batch 55', dept: 'BBA', text: 'The AI Career Mentor answered all my questions about MBA admissions at 2 AM when I was stressed. Having 24/7 guidance is incredible.', avatar: 'F' },
    { name: 'Nabil Hassan', batch: 'Batch 53', dept: 'EEE', text: 'I uploaded my lab reports and the AI summarized everything perfectly. Studying has never been this efficient. Highly recommend to every IIUC student!', avatar: 'N' },
    { name: 'Sumaiya Islam', batch: 'Batch 56', dept: 'English', text: 'As a senior, I love giving back to juniors through MentorBridge. The platform makes mentorship structured and meaningful.', avatar: 'S' },
  ];

  const faqs = [
    { q: 'Who can join MentorBridge?', a: 'MentorBridge is exclusively for IIUC (International Islamic University Chittagong) students and alumni. You must confirm your IIUCian status during registration.' },
    { q: 'Is MentorBridge free to use?', a: 'Yes! MentorBridge is completely free for all IIUC students and alumni. No hidden charges, no premium tiers.' },
    { q: 'How does the AI Career Mentor work?', a: 'Our AI Mentor is powered by Meta\'s LLaMA 3.3 70B model via Groq API. It provides career guidance, internship advice, and can answer questions about uploaded course materials.' },
    { q: 'Can I upload any type of file?', a: 'Currently, the Resource section supports PDF files up to 10MB. After upload, AI automatically analyzes the content and creates a summary.' },
    { q: 'How is my data protected?', a: 'Your passwords are hashed with bcryptjs. All API calls require JWT authentication. Sensitive data is stored in environment variables, never in code.' },
    { q: 'Can I message anyone on the platform?', a: 'You can only message people you are connected with. Send a connection request first, and once accepted, direct messaging becomes available.' },
  ];

  const whyPoints = [
    { icon: '🎓', title: 'IIUC Exclusive', desc: 'Built specifically for the IIUC community. Every feature is designed around your university experience.' },
    { icon: '🔒', title: 'Safe & Verified', desc: 'IIUCian-only access ensures a trustworthy community of genuine students and alumni.' },
    { icon: '⚡', title: 'AI-Powered', desc: 'From career guidance to resource analysis — artificial intelligence enhances every aspect of your learning.' },
    { icon: '🌱', title: 'Grow Together', desc: 'The more IIUCians join, the stronger the network becomes. Your success helps others succeed too.' },
  ];

  return (
    <div style={{background:'#1a2018', color:'white', fontFamily:'system-ui, sans-serif', overflowX:'hidden'}}>

      {/* Sticky Top CTA - disappears when bottom CTA visible */}
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        background: scrolled ? 'rgba(15,25,13,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(34,197,94,0.15)' : 'none',
        transition:'all 0.4s ease',
        padding:'0.75rem 1.5rem',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <Link href="/landing" style={{display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none'}}>
          <Logo size={32}/>
          <div>
            <div style={{fontSize:'0.9rem', fontWeight:800, color:'#22c55e', lineHeight:1}}>IIUC</div>
            <div style={{fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.05em'}}>MentorBridge</div>
          </div>
        </Link>

        <nav style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
          {['features', 'how-it-works', 'testimonials', 'faq'].map(id => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background:'none', border:'none', color: activeNav === id ? '#22c55e' : 'rgba(255,255,255,0.6)',
              cursor:'pointer', fontSize:'0.82rem', fontWeight:500, textTransform:'capitalize',
              transition:'color 0.2s'
            }}>
              {id.replace('-', ' ')}
            </button>
          ))}
        </nav>

        <div style={{display:'flex', gap:'0.75rem'}}>
          <Link href="/login" style={{
            color:'rgba(255,255,255,0.7)', textDecoration:'none', fontSize:'0.85rem',
            padding:'0.45rem 1rem', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)',
            transition:'all 0.2s'
          }}>Login</Link>
          <Link href="/register" style={{
            background:'linear-gradient(135deg,#16a34a,#15803d)',
            color:'white', textDecoration:'none', fontSize:'0.85rem',
            padding:'0.45rem 1.1rem', borderRadius:'8px', fontWeight:600,
            boxShadow:'0 0 20px rgba(34,197,94,0.3)'
          }}>Join Free</Link>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{
        minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
        background:'radial-gradient(ellipse at 30% 50%, rgba(22,163,74,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(15,61,46,0.2) 0%, transparent 50%), #1a2018'
      }}>
        {/* Animated background blobs */}
        <div style={{position:'absolute', width:'600px', height:'600px', borderRadius:'50%',
          background:'rgba(34,197,94,0.05)', filter:'blur(80px)',
          top:'-10%', left:'-10%', animation:'float 10s ease-in-out infinite'}}/>
        <div style={{position:'absolute', width:'400px', height:'400px', borderRadius:'50%',
          background:'rgba(15,61,46,0.1)', filter:'blur(60px)',
          bottom:'10%', right:'5%', animation:'float 8s ease-in-out infinite 3s'}}/>

        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.03)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
          @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(34,197,94,0.3)} 50%{box-shadow:0 0 40px rgba(34,197,94,0.6)} }
          .animate-in { animation: fadeUp 0.7s ease forwards; }
          .section-animate { opacity:0; transform:translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
          .section-animate.visible { opacity:1; transform:translateY(0); }
          .hover-card:hover { transform:translateY(-6px); box-shadow:0 0 30px rgba(34,197,94,0.15); }
          .hover-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .glow-btn { animation: glow 3s ease-in-out infinite; }
          .faq-item { border-bottom: 1px solid rgba(34,197,94,0.12); }
          .nav-scroll::-webkit-scrollbar { display:none; }
        `}</style>

        <div style={{textAlign:'center', padding:'8rem 1.5rem 4rem', maxWidth:'800px', position:'relative', zIndex:1}}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)',
            borderRadius:'999px', padding:'0.35rem 1rem', fontSize:'0.78rem',
            color:'#22c55e', marginBottom:'1.5rem', animation:'fadeUp 0.5s ease forwards'
          }}>
            <span>🎓</span> Exclusively for IIUCians
          </div>

          <h1 style={{
            fontSize:'clamp(2.5rem, 6vw, 4.5rem)', fontWeight:900, lineHeight:1.1,
            marginBottom:'1.25rem', animation:'fadeUp 0.6s ease 0.1s both'
          }}>
            Connect with{' '}
            <span style={{
              background:'linear-gradient(135deg, #22c55e, #86efac)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
            }}>IIUC Seniors</span>
            <br/>Who've Been There
          </h1>

          <p style={{
            fontSize:'1.1rem', color:'rgba(255,255,255,0.55)', lineHeight:1.7,
            maxWidth:'560px', margin:'0 auto 2rem',
            animation:'fadeUp 0.6s ease 0.2s both'
          }}>
            MentorBridge connects IIUC students with alumni for mentorship, career guidance,
            and AI-powered learning. Your senior's experience is your shortcut to success.
          </p>

          <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', animation:'fadeUp 0.6s ease 0.3s both'}}>
            <Link href="/register" style={{
              background:'linear-gradient(135deg,#16a34a,#15803d)',
              color:'white', textDecoration:'none', fontSize:'1rem',
              padding:'0.875rem 2rem', borderRadius:'12px', fontWeight:700,
              display:'inline-flex', alignItems:'center', gap:'0.5rem'
            }} className="glow-btn">
              Get Started Free →
            </Link>
            <button onClick={() => scrollTo('how-it-works')} style={{
              background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
              border:'1px solid rgba(255,255,255,0.15)', fontSize:'1rem',
              padding:'0.875rem 2rem', borderRadius:'12px', cursor:'pointer', fontWeight:500
            }}>
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display:'flex', gap:'2.5rem', justifyContent:'center', marginTop:'3.5rem',
            animation:'fadeUp 0.6s ease 0.4s both', flexWrap:'wrap'
          }}>
            {[
              {num:'IIUC', label:'Students & Alumni'},
              {num:'AI', label:'Powered Career Mentor'},
              {num:'Free', label:'Forever for IIUCians'},
            ].map((stat, i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:'1.75rem', fontWeight:800, color:'#22c55e'}}>{stat.num}</div>
                <div style={{fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', marginTop:'0.2rem'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" data-animate style={{padding:'6rem 1.5rem', background:'rgba(0,0,0,0.2)'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'3.5rem'}} data-animate id="features-header"
            className={`section-animate ${visible['features-header'] ? 'visible' : ''}`}>
            <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
              Everything You Need
            </div>
            <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800, marginBottom:'1rem'}}>
              Features Built for <span style={{color:'#22c55e'}}>IIUCians</span>
            </h2>
            <p style={{color:'rgba(255,255,255,0.45)', fontSize:'1rem', maxWidth:'500px', margin:'0 auto'}}>
              Every feature is designed around the specific needs of IIUC students and alumni.
            </p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'1rem'}}>
            {features.map((f, i) => (
              <div key={i} id={`feat-${i}`} data-animate
                className={`hover-card section-animate ${visible[`feat-${i}`] ? 'visible' : ''}`}
                style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,197,94,0.15)',
                  borderRadius:'16px', padding:'1.5rem',
                  transitionDelay:`${i * 0.1}s`
                }}>
                <div style={{fontSize:'2.25rem', marginBottom:'1rem'}}>{f.icon}</div>
                <h3 style={{fontWeight:700, fontSize:'1rem', marginBottom:'0.5rem', color:'white'}}>{f.title}</h3>
                <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.875rem', lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{padding:'6rem 1.5rem'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'3.5rem'}} id="hiw-header" data-animate
            className={`section-animate ${visible['hiw-header'] ? 'visible' : ''}`}>
            <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
              Simple Process
            </div>
            <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800}}>
              How MentorBridge Works
            </h2>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px,1fr))', gap:'1.5rem'}}>
            {steps.map((s, i) => (
              <div key={i} id={`step-${i}`} data-animate
                className={`section-animate ${visible[`step-${i}`] ? 'visible' : ''}`}
                style={{textAlign:'center', transitionDelay:`${i * 0.15}s`}}>
                <div style={{
                  width:'64px', height:'64px', borderRadius:'50%', margin:'0 auto 1.25rem',
                  background:'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(15,61,46,0.3))',
                  border:'2px solid rgba(34,197,94,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.25rem', fontWeight:800, color:'#22c55e'
                }}>{s.step}</div>
                <h3 style={{fontWeight:700, fontSize:'1rem', marginBottom:'0.5rem'}}>{s.title}</h3>
                <p style={{color:'rgba(255,255,255,0.45)', fontSize:'0.875rem', lineHeight:1.6}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section style={{padding:'6rem 1.5rem', background:'rgba(0,0,0,0.2)'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', alignItems:'center'}}
            id="ai-section" data-animate className={`section-animate ${visible['ai-section'] ? 'visible' : ''}`}>
            <div>
              <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
                🤖 AI-Powered
              </div>
              <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.25rem)', fontWeight:800, marginBottom:'1rem', lineHeight:1.2}}>
                Your Personal Career Mentor,{' '}
                <span style={{color:'#22c55e'}}>Available 24/7</span>
              </h2>
              <p style={{color:'rgba(255,255,255,0.5)', lineHeight:1.7, marginBottom:'1.5rem', fontSize:'0.95rem'}}>
                Powered by Meta's LLaMA 3.3 70B model via Groq API — one of the most capable AI models available.
                Ask anything about careers, internships, courses, or university life.
              </p>
              {[
                'Career path guidance for CSE, BBA, EEE students',
                'Internship search strategies and CV tips',
                'Course-specific help from uploaded resources',
                'Interview preparation and job market insights',
              ].map((item, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.65rem'}}>
                  <div style={{width:'20px', height:'20px', borderRadius:'50%', background:'rgba(34,197,94,0.2)',
                    border:'1px solid rgba(34,197,94,0.4)', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0, fontSize:'0.65rem', color:'#22c55e'}}>✓</div>
                  <span style={{color:'rgba(255,255,255,0.6)', fontSize:'0.875rem'}}>{item}</span>
                </div>
              ))}
              <Link href="/register" style={{
                display:'inline-flex', alignItems:'center', gap:'0.5rem', marginTop:'1rem',
                background:'linear-gradient(135deg,#16a34a,#15803d)',
                color:'white', textDecoration:'none', padding:'0.75rem 1.5rem',
                borderRadius:'10px', fontWeight:600, fontSize:'0.9rem'
              }}>Try AI Mentor Free →</Link>
            </div>

            {/* Chat Preview */}
            <div style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'16px', overflow:'hidden'}}>
              <div style={{padding:'0.875rem 1rem', borderBottom:'1px solid rgba(34,197,94,0.12)', background:'rgba(34,197,94,0.05)', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e'}}/>
                <span style={{fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', fontWeight:600}}>AI Career Mentor</span>
              </div>
              <div style={{padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                {[
                  {role:'user', text:'How do I find a good internship as a CSE student?'},
                  {role:'ai', text:'Great question! Here are the most effective strategies:\n\n1. Build projects on GitHub\n2. Apply on LinkedIn and local job boards\n3. Network with IIUC seniors in your field\n4. Prepare for technical interviews with practice problems'},
                  {role:'user', text:'What skills should I learn first?'},
                  {role:'ai', text:'For CSE at IIUC, I recommend starting with: Python or JavaScript, then a web framework like Django or React. Database knowledge (SQL) is essential too!'},
                ].map((msg, i) => (
                  <div key={i} style={{display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                    <div style={{
                      maxWidth:'85%', padding:'0.55rem 0.875rem', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                      fontSize:'0.78rem', lineHeight:'1.5',
                      background: msg.role === 'user' ? 'linear-gradient(135deg,#16a34a,#0f3d2e)' : 'rgba(255,255,255,0.07)',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      color: msg.role === 'user' ? 'white' : 'rgba(255,255,255,0.8)',
                      whiteSpace:'pre-line'
                    }}>{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why MentorBridge */}
      <section style={{padding:'6rem 1.5rem'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'3.5rem'}} id="why-header" data-animate
            className={`section-animate ${visible['why-header'] ? 'visible' : ''}`}>
            <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
              Why Choose Us
            </div>
            <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800}}>
              Why <span style={{color:'#22c55e'}}>MentorBridge?</span>
            </h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'1rem'}}>
            {whyPoints.map((w, i) => (
              <div key={i} id={`why-${i}`} data-animate
                className={`hover-card section-animate ${visible[`why-${i}`] ? 'visible' : ''}`}
                style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,197,94,0.15)',
                  borderRadius:'14px', padding:'1.5rem', textAlign:'center',
                  transitionDelay:`${i*0.1}s`
                }}>
                <div style={{fontSize:'2.5rem', marginBottom:'0.75rem'}}>{w.icon}</div>
                <h3 style={{fontWeight:700, fontSize:'0.95rem', marginBottom:'0.5rem', color:'white'}}>{w.title}</h3>
                <p style={{color:'rgba(255,255,255,0.4)', fontSize:'0.82rem', lineHeight:1.6}}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{padding:'6rem 1.5rem', background:'rgba(0,0,0,0.2)'}}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'3.5rem'}} id="test-header" data-animate
            className={`section-animate ${visible['test-header'] ? 'visible' : ''}`}>
            <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
              Student Stories
            </div>
            <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800}}>
              What IIUCians Are Saying
            </h2>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px,1fr))', gap:'1rem'}}>
            {testimonials.map((t, i) => (
              <div key={i} id={`test-${i}`} data-animate
                className={`hover-card section-animate ${visible[`test-${i}`] ? 'visible' : ''}`}
                style={{
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(34,197,94,0.12)',
                  borderRadius:'16px', padding:'1.5rem', transitionDelay:`${i*0.1}s`
                }}>
                <div style={{color:'#22c55e', fontSize:'1.5rem', marginBottom:'0.75rem', lineHeight:1}}>"</div>
                <p style={{color:'rgba(255,255,255,0.65)', fontSize:'0.875rem', lineHeight:1.7, marginBottom:'1.25rem'}}>{t.text}</p>
                <div style={{display:'flex', alignItems:'center', gap:'0.75rem'}}>
                  <div style={{
                    width:'40px', height:'40px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg,#16a34a,#0f3d2e)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:700, color:'white', fontSize:'0.9rem'
                  }}>{t.avatar}</div>
                  <div>
                    <p style={{fontWeight:600, fontSize:'0.875rem', color:'white'}}>{t.name}</p>
                    <p style={{color:'rgba(255,255,255,0.35)', fontSize:'0.72rem'}}>{t.dept} • {t.batch}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:'6rem 1.5rem'}}>
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'3.5rem'}} id="faq-header" data-animate
            className={`section-animate ${visible['faq-header'] ? 'visible' : ''}`}>
            <div style={{color:'#22c55e', fontSize:'0.8rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem'}}>
              Got Questions?
            </div>
            <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800}}>
              Frequently Asked Questions
            </h2>
          </div>
          <div id="faq-list" data-animate className={`section-animate ${visible['faq-list'] ? 'visible' : ''}`}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" style={{padding:'1.25rem 0'}}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width:'100%', background:'none', border:'none', color:'white',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    cursor:'pointer', textAlign:'left', gap:'1rem'
                  }}>
                  <span style={{fontWeight:600, fontSize:'0.95rem'}}>{faq.q}</span>
                  <span style={{
                    color:'#22c55e', fontSize:'1.25rem', flexShrink:0,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition:'transform 0.3s ease'
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{color:'rgba(255,255,255,0.5)', fontSize:'0.875rem', lineHeight:1.7, marginTop:'0.75rem', paddingRight:'2rem'}}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section id="bottom-cta" style={{padding:'6rem 1.5rem', background:'rgba(0,0,0,0.3)'}}>
        <div style={{maxWidth:'700px', margin:'0 auto', textAlign:'center'}} id="cta-content" data-animate
          className={`section-animate ${visible['cta-content'] ? 'visible' : ''}`}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🎓</div>
          <h2 style={{fontSize:'clamp(1.75rem, 4vw, 2.5rem)', fontWeight:800, marginBottom:'1rem', lineHeight:1.2}}>
            Ready to Accelerate<br/>Your <span style={{color:'#22c55e'}}>IIUC Journey?</span>
          </h2>
          <p style={{color:'rgba(255,255,255,0.5)', fontSize:'1rem', lineHeight:1.7, marginBottom:'2rem', maxWidth:'480px', margin:'0 auto 2rem'}}>
            Join hundreds of IIUCians who are already connecting, learning, and growing together on MentorBridge.
          </p>
          <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
            <Link href="/register" style={{
              background:'linear-gradient(135deg,#16a34a,#15803d)',
              color:'white', textDecoration:'none', fontSize:'1rem',
              padding:'0.875rem 2rem', borderRadius:'12px', fontWeight:700,
              display:'inline-flex', alignItems:'center', gap:'0.5rem',
              boxShadow:'0 0 30px rgba(34,197,94,0.3)'
            }} className="glow-btn">
              Create Free Account →
            </Link>
            <Link href="/login" style={{
              background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.8)',
              border:'1px solid rgba(255,255,255,0.15)', textDecoration:'none',
              fontSize:'1rem', padding:'0.875rem 2rem', borderRadius:'12px', fontWeight:500
            }}>
              Already a member? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background:'#111a10', borderTop:'1px solid rgba(34,197,94,0.15)',
        padding:'3rem 1.5rem'
      }}>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'2rem', marginBottom:'2rem'}}>
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem'}}>
                <Logo size={28}/>
                <div>
                  <div style={{fontSize:'0.9rem', fontWeight:800, color:'#22c55e'}}>IIUC</div>
                  <div style={{fontSize:'0.62rem', color:'rgba(255,255,255,0.3)'}}>MentorBridge</div>
                </div>
              </div>
              <p style={{color:'rgba(255,255,255,0.3)', fontSize:'0.78rem', lineHeight:1.6}}>
                Connecting IIUC students and alumni for mentorship and career growth.
              </p>
            </div>
            <div>
              <h4 style={{color:'rgba(255,255,255,0.6)', fontWeight:700, marginBottom:'0.65rem', fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>Platform</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.45rem'}}>
                {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Testimonials', '#testimonials'], ['FAQ', '#faq']].map(([label, href]) => (
                  <button key={label} onClick={() => scrollTo(href.slice(1))} style={{background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:'0.8rem', cursor:'pointer', textAlign:'left', padding:0}}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{color:'rgba(255,255,255,0.6)', fontWeight:700, marginBottom:'0.65rem', fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>Developer</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.45rem', color:'rgba(255,255,255,0.35)', fontSize:'0.78rem'}}>
                <span>Sakibul Islam Sakif</span>
                <span>IIUC • CSE Department</span>
                <a href="mailto:islamsakifbul@gmail.com" style={{color:'rgba(255,255,255,0.35)', textDecoration:'none'}}>islamsakifbul@gmail.com</a>
                <a href="https://www.facebook.com/sakibul.sakif" target="_blank" rel="noreferrer" style={{color:'#22c55e', textDecoration:'none'}}>Facebook Profile</a>
              </div>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(34,197,94,0.1)', paddingTop:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem'}}>
            <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem'}}>© 2026 IIUC MentorBridge — All rights reserved</p>
            <p style={{color:'rgba(255,255,255,0.2)', fontSize:'0.72rem'}}>Built with ❤️ by Sakibul Islam Sakif</p>
          </div>
        </div>
      </footer>

    </div>
  );
}