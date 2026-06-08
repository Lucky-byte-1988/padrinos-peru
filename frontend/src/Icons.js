import React from 'react';

export const HeartIcon = ({ filled, size = 26 }) => (
  filled ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#e0245e" aria-hidden="true">
      <path d="M12 21s-6.7-4.35-9.33-8.04C.9 10.3 1.4 6.9 4.1 5.6c2-1 4.2-.4 5.5 1.2L12 9.3l2.4-2.5c1.3-1.6 3.5-2.2 5.5-1.2 2.7 1.3 3.2 4.7 1.43 7.36C18.7 16.65 12 21 12 21z"/>
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.3l-1.1-1C6.1 15 3 12.3 3 8.9 3 6.4 4.9 4.5 7.4 4.5c1.5 0 2.9.7 3.8 1.9l.8 1 .8-1c.9-1.2 2.3-1.9 3.8-1.9 2.5 0 4.4 1.9 4.4 4.4 0 3.4-3.1 6.1-7.9 10.4l-1.1 1z"/>
    </svg>
  )
);

export const CommentIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/>
  </svg>
);

export const ShareIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export const WhatsAppIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#25d366" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.42 1.31-1.96 1.36-.5.05-1.14.21-3.69-.77-3.1-1.22-5.08-4.37-5.24-4.57-.15-.2-1.25-1.66-1.25-3.17 0-1.51.79-2.25 1.07-2.56.28-.31.61-.39.81-.39.2 0 .41 0 .58.01.19.01.44-.07.69.53.24.6.83 2.07.9 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.18-.31.4-.45.53-.15.15-.3.31-.13.61.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.64-.08.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.07.12.07.72-.17 1.4z"/>
  </svg>
);

export const GiftIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="8" width="18" height="4" rx="1"/>
    <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/>
    <line x1="12" y1="8" x2="12" y2="21"/>
    <path d="M12 8S10.5 3.5 8 4.5C6.3 5.2 7 8 9 8z"/>
    <path d="M12 8s1.5-4.5 4-3.5C17.7 5.2 17 8 15 8z"/>
  </svg>
);

export const LetterIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5"/>
    <path d="M3.5 6.5 L12 13 L20.5 6.5"/>
  </svg>
);

export const BookmarkIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
