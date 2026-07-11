export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trunk */}
      <rect x="22" y="30" width="4" height="12" rx="2" fill="#15803d"/>
      {/* Roots */}
      <path d="M22 40 Q18 43 14 42" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M26 40 Q30 43 34 42" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M22 38 Q19 41 16 40" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M26 38 Q29 41 32 40" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      {/* Main branches */}
      <path d="M24 30 Q16 22 10 18" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M24 30 Q32 22 38 18" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M24 26 Q20 18 18 12" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M24 26 Q28 18 30 12" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M24 22 Q24 14 24 8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Leaves - left cluster */}
      <circle cx="10" cy="16" r="5" fill="#22c55e" opacity="0.9"/>
      <circle cx="7" cy="13" r="3.5" fill="#4ade80" opacity="0.8"/>
      <circle cx="13" cy="12" r="3" fill="#16a34a" opacity="0.9"/>
      {/* Leaves - right cluster */}
      <circle cx="38" cy="16" r="5" fill="#22c55e" opacity="0.9"/>
      <circle cx="41" cy="13" r="3.5" fill="#4ade80" opacity="0.8"/>
      <circle cx="35" cy="12" r="3" fill="#16a34a" opacity="0.9"/>
      {/* Leaves - top */}
      <circle cx="24" cy="6" r="5.5" fill="#22c55e" opacity="0.95"/>
      <circle cx="20" cy="4" r="3.5" fill="#4ade80" opacity="0.85"/>
      <circle cx="28" cy="4" r="3.5" fill="#4ade80" opacity="0.85"/>
      <circle cx="24" cy="3" r="3" fill="#86efac" opacity="0.7"/>
      {/* Left mid leaves */}
      <circle cx="18" cy="11" r="4" fill="#22c55e" opacity="0.85"/>
      <circle cx="15" cy="9" r="3" fill="#4ade80" opacity="0.75"/>
      {/* Right mid leaves */}
      <circle cx="30" cy="11" r="4" fill="#22c55e" opacity="0.85"/>
      <circle cx="33" cy="9" r="3" fill="#4ade80" opacity="0.75"/>
    </svg>
  );
}