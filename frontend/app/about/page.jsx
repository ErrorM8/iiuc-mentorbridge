'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Mail,
  Users,
  BookOpen,
  Bot,
  Droplets,
  ShoppingBag,
  Award,
  Code2,
  ExternalLink,
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Invalid user data:', error);
      }
    }
  }, [router]);

  // =========================
  // FEATURES
  // =========================
  const features = [
    {
      icon: <Users size={20} color="#22c55e" />,
      title: 'Community Network',
      desc: 'Connect with seniors, juniors, and alumni from all IIUC departments for mentorship and guidance.',
    },
    {
      icon: <BookOpen size={20} color="#60a5fa" />,
      title: 'Academic Resources',
      desc: 'Share and access study materials, past papers, and resources organized by department and course.',
    },
    {
      icon: <Bot size={20} color="#a78bfa" />,
      title: 'AI Career Mentor',
      desc: 'Get 24/7 career advice, technical help, and academic guidance powered by advanced AI.',
    },
    {
      icon: <Droplets size={20} color="#ef4444" />,
      title: 'Blood Bank',
      desc: 'Emergency blood request system connecting donors with those in need within the IIUC community.',
    },
    {
      icon: <ShoppingBag size={20} color="#f59e0b" />,
      title: 'Marketplace',
      desc: 'Buy and sell items within the campus community — books, electronics, and more.',
    },
    {
      icon: <Award size={20} color="#22c55e" />,
      title: 'Mentorship System',
      desc: 'Senior students guide juniors through academic challenges and career decisions.',
    },
  ];

  // =========================
  // TEAM
  // =========================
  const team = [
    {
      name: 'Sakibul Islam Sakif',
      id: 'C241268',
      role: 'Founder · Full-Stack Developer · AI · Database',
      dept: 'CSE',
      email: 'islamsakifbul@gmail.com',
      fb: 'https://www.facebook.com/sakibul.sakif',
      github: 'https://github.com/ErrorM8',
    },
  ];

  return (
    <div className="page-bg">

      {/* =========================
          SIDEBAR
      ========================= */}
      <Sidebar user={user} />

      {/* =========================
          MAIN AREA
      ========================= */}
      <div className="main-with-sidebar">

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <div
          className="center-wrap"
          style={{
            flex: 1,
            paddingTop: '2rem',
            paddingBottom: '3rem',
          }}
        >

          {/* =========================
              HERO
          ========================= */}
          <div
            className="glass-card"
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              background:
                'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(15,61,46,0.15))',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1rem',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              <Logo size={64} />
            </div>

            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: '2rem',
                color: 'white',
                marginBottom: '0.5rem',
              }}
            >
              IIUC{' '}
              <span style={{ color: '#22c55e' }}>
                MentorBridge
              </span>
            </h1>

            <p
              style={{
                color: 'var(--text2)',
                fontSize: '1rem',
                maxWidth: '500px',
                margin: '0 auto',
                lineHeight: '1.7',
              }}
            >
              Connecting IIUC students and alumni for mentorship,
              collaboration, and career growth.
            </p>
          </div>

          {/* =========================
              FEATURES TITLE
          ========================= */}
          <h3
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '0.875rem',
            }}
          >
            What We Offer
          </h3>

          {/* =========================
              FEATURES
          ========================= */}
          <div
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.75rem',
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card pulse-hover"
                style={{
                  padding: '1.25rem',
                }}
              >
                {/* Feature Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '11px',
                    background: 'rgba(255,255,255,0.05)',
                    border:
                      '1px solid rgba(34,197,94,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  {feature.icon}
                </div>

                {/* Feature Title */}
                <p
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    marginBottom: '0.35rem',
                    fontFamily:
                      "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {feature.title}
                </p>

                {/* Feature Description */}
                <p
                  style={{
                    color: 'var(--text2)',
                    fontSize: '0.8rem',
                    lineHeight: '1.6',
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* =========================
              TEAM TITLE
          ========================= */}
          <h3
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: 'white',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginBottom: '0.875rem',
            }}
          >
            Team Error Mate
          </h3>

          {/* =========================
              TEAM CARD
              FIXED: ONE COLUMN
          ========================= */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              width: '100%',
              gap: '0.75rem',
              marginBottom: '1.75rem',
            }}
          >
            {team.map((member, index) => (
              <div
                key={index}
                className="glass-card"
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >

                {/* =========================
                    PROFILE AVATAR
                ========================= */}
                <div
                  style={{
                    width: '58px',
                    height: '58px',
                    minWidth: '58px',
                    borderRadius: '15px',
                    background:
                      'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(15,61,46,0.3))',
                    border:
                      '1px solid rgba(34,197,94,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#22c55e',
                    fontFamily:
                      "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {member.name.charAt(0)}
                </div>

                {/* =========================
                    PROFILE INFORMATION
                ========================= */}
                <div
                  style={{
                    flex: 1,
                    minWidth: '220px',
                  }}
                >
                  {/* Name */}
                  <p
                    style={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '0.2rem',
                      fontFamily:
                        "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {member.name}
                  </p>

                  {/* ID */}
                  <p
                    style={{
                      color: '#22c55e',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.3rem',
                    }}
                  >
                    {member.id}
                  </p>

                  {/* Role */}
                  <p
                    style={{
                      color: 'var(--text2)',
                      fontSize: '0.8rem',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {member.role}
                  </p>

                  {/* Department */}
                  <p
                    style={{
                      color: 'var(--text3)',
                      fontSize: '0.75rem',
                      marginBottom: '0.7rem',
                    }}
                  >
                    Department of {member.dept}
                  </p>

                  {/* =========================
                      SOCIAL / CONTACT
                  ========================= */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >

                    {/* Email */}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        style={{
                          color: 'var(--text3)',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Mail size={12} />
                        {member.email}
                      </a>
                    )}

                    {/* Facebook */}
                    {member.fb && (
                      <a
                        href={member.fb}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--text3)',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <ExternalLink size={12} />
                        Facebook
                      </a>
                    )}

                    {/* GitHub */}
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--text3)',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Code2 size={12} />
                        github.com/ErrorM8
                      </a>
                    )}

                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* =========================
              OPEN SOURCE
          ========================= */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '0',
            }}
          >

            {/* Icon */}
            <Code2
              size={28}
              color="#22c55e"
            />

            {/* Text */}
            <div
              style={{
                flex: 1,
                minWidth: '200px',
              }}
            >
              <p
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '0.2rem',
                  fontFamily:
                    "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Open Source
              </p>

              <p
                style={{
                  color: 'var(--text2)',
                  fontSize: '0.8rem',
                }}
              >
                This project is publicly available on GitHub
              </p>
            </div>

            {/* GitHub Button */}
            <a
              href="https://github.com/ErrorM8"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{
                flexShrink: 0,
                fontSize: '0.82rem',
                padding: '0.55rem 1.25rem',
                textDecoration: 'none',
              }}
            >
              View on GitHub →
            </a>

          </div>

        </div>

        {/* =========================
            FOOTER
        ========================= */}
        <Footer />

      </div>

      {/* =========================
          FLOAT ANIMATION
      ========================= */}
      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-5px);
            }
          }

          @media (max-width: 600px) {
            .glass-card {
              box-sizing: border-box;
            }
          }
        `}
      </style>

    </div>
  );
}