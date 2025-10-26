
import React from 'react';

const MartabakIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 12.5c-1.63 0-3.06.8-3.98 2h7.96c-.92-1.2-2.35-2-3.98-2zM12 7c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" opacity=".3" />
    <path d="M12 7c.55 0 1 .45 1 1v3h-2V8c0-.55.45-1 1-1zm-.5 6.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5H11.5z" />
  </svg>
);

export default MartabakIcon;
