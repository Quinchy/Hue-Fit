import React from 'react';

const DashboardLayoutWrapper = ({ children }) => {
  return (
    <div className='mt-5 flex flex-col gap-5'>
      {children}
    </div>
  );
};

export default DashboardLayoutWrapper;