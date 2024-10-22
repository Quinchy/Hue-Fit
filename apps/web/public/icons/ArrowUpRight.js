import React from 'react';

const ArrowUpRight = ({ width = 30, height = 30, className = '' }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className} // Allow passing Tailwind classes for styling
    >
      <path
        d="M8.25121 23.2517L8.16283 23.1633L8.25122 23.2517L21.437 10.0647V19.6875C21.437 19.9693 21.549 20.2395 21.7482 20.4388C21.9475 20.6381 22.2178 20.75 22.4995 20.75C22.7813 20.75 23.0516 20.6381 23.2508 20.4388C23.4501 20.2395 23.562 19.9693 23.562 19.6875V7.5C23.562 7.21821 23.4501 6.94796 23.2508 6.7487C23.0516 6.54944 22.7813 6.4375 22.4995 6.4375H10.312C10.0303 6.4375 9.76 6.54944 9.56074 6.7487C9.36149 6.94796 9.24954 7.21821 9.24954 7.5C9.24954 7.78179 9.36149 8.05204 9.56074 8.2513C9.76 8.45056 10.0303 8.5625 10.312 8.5625H19.9349L6.74788 21.7483L6.83618 21.8366L6.74788 21.7483C6.54852 21.9477 6.43652 22.2181 6.43652 22.5C6.43652 22.7819 6.54852 23.0523 6.74787 23.2517C6.94723 23.451 7.21761 23.563 7.49954 23.563C7.78148 23.563 8.05186 23.451 8.25121 23.2517Z"
        fill="currentColor" // Use currentColor to allow parent control
        stroke="currentColor" // Also use currentColor for stroke
        strokeWidth="0.25"
      />
    </svg>
  );
};

export default ArrowUpRight;
