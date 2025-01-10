import React from 'react';

const DashboardLayoutWrapper = ({ children }) => {
  return (
    <div className='mt-5 pr-10 flex flex-col w-full gap-6'>
      {children}
    </div>
  );
};

export default DashboardLayoutWrapper;