import { useState } from 'react';

export default function Avatar({ user, size = 36, radius = '50%', onClick }) {
  const [imgError, setImgError] = useState(false);

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: radius,
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
  };

  if (user?.avatar && !imgError) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || ''}
        onError={() => setImgError(true)}
        onClick={onClick}
        style={{...style, objectFit: 'cover', border: '1px solid rgba(34,197,94,0.25)'}}
      />
    );
  }

  return (
    <div onClick={onClick} style={{
      ...style,
      background: 'linear-gradient(135deg,#16a34a,#0f3d2e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(size * 0.38, 10)}px`,
      fontWeight: 700,
      color: 'white',
      border: '1px solid rgba(34,197,94,0.25)',
    }}>
      {user?.name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}