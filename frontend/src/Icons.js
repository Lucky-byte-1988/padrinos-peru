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

export const BookmarkIcon = ({ size = 25 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
