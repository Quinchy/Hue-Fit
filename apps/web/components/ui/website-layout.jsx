import React from 'react';
import Footer from "@/components/ui/footer";

const WebsiteLayoutWrapper = ({ children }) => {
  return (
    <div className='mt-24 flex flex-col w-full justify-center items-center gap-20'>
      {children}
      <Footer/>
    </div>
  );
};

export default WebsiteLayoutWrapper;