import React from 'react';

const WebsiteLayoutWrapper = ({ children }) => {
  return (
    <div className='mt-44 flex flex-col w-full gap-20'>
      {children}
    </div>
  );
};

export default WebsiteLayoutWrapper;