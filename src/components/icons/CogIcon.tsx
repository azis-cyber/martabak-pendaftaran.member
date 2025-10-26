import React from 'react';

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M12 2v2" />
    <path d="M12 22v-2" />
    <path d="m17 20.66-1-1.73" />
    <path d="m11 10.27 1 1.73" />
    <path d="m7 20.66 1-1.73" />
    <path d="m13 10.27-1 1.73" />
    <path d="m5.64 17-1.73-1" />
    <path d="m18.36 9 1.73 1" />
    <path d="m5.64 7 1.73 1" />
    <path d="m18.36 15-1.73-1" />
    <path d="M2 12h2" />
    <path d="M22 12h-2" />
  </svg>
);

export default CogIcon;
