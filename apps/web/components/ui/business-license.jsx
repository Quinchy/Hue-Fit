// components/ui/BusinessLicense.js
import { useState } from 'react';
import Dialog from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const BusinessLicense = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPdf = imageUrl.toLowerCase().endsWith('.pdf');
  const placeholderImage = '/images/placeholder-pdf.png'; // Update this path if necessary

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Thumbnail or placeholder for PDF */}
      <Image
        src={isPdf ? placeholderImage : imageUrl}
        alt="Business License"
        width={128}
        height={128}
        onClick={!isPdf ? handleOpenModal : undefined} // Only open modal for images
        className="cursor-pointer object-cover rounded shadow-md"
      />

      {/* Open PDF Button, prevents form submission */}
      {isPdf && (
        <Link
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 bg-primary text-background w-full text-center font-bold rounded px-4 py-2"
        >
          Open PDF
        </Link>
      )}

      {/* Image Modal for image files only */}
      {!isPdf && isModalOpen && (
        <Dialog onClose={handleCloseModal} isOpen={isModalOpen}>
          <div className="relative flex items-center justify-center">
            <Image
              src={imageUrl}
              alt="Business License Full View"
              width={420}
              height={420}
              className="object-fill rounded shadow-lg"
            />
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default BusinessLicense;
