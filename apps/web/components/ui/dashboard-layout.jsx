import React from 'react';

const DashboardLayoutWrapper = ({ children }) => {
  return (
    <div className='mt-5 pr-5 mb-5 flex flex-col w-full gap-5'>
      {children}
    </div>
  );
};

export default DashboardLayoutWrapper;