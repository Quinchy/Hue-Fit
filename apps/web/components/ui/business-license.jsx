// components/ui/BusinessLicense.js
import { useState } from 'react';
import Dialog from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const BusinessLicense = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine if the file is a PDF
  const isPdf = imageUrl.toLowerCase().endsWith('.pdf');
  const placeholderImage = '/images/placeholder-pdf.jpg'; // Path to the PDF placeholder image

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail */}
      <img 
        src={isPdf ? placeholderImage : imageUrl} // Use placeholder for PDFs
        alt="Business License" 
        onClick={!isPdf ? handleOpenModal : undefined} // Only open modal for images
        className="cursor-pointer w-32 h-32 object-cover rounded shadow-md"
      />

      {/* Open button for PDFs to open in a new tab */}
      {isPdf && (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2">
          <Button>Open PDF</Button>
        </a>
      )}

      {/* Modal Popup for image files only */}
      {!isPdf && isModalOpen && (
        <Dialog onClose={handleCloseModal} isOpen={isModalOpen}>
          <div className="relative flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt="Business License Full View" 
              className="max-w-[45rem] min-h-[45rem] max-h-[45rem] object-scale-down rounded shadow-lg"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default BusinessLicense;
