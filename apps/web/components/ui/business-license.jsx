// components/ui/BusinessLicense.js
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const BusinessLicense = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPdf = imageUrl.toLowerCase().endsWith('.pdf');
  const placeholderImage = '/images/placeholder-pdf.png'; // Update this path if necessary

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
        onClick={!isPdf ? () => setIsModalOpen(true) : undefined} // Only open modal for images
        className="cursor-pointer object-contain rounded shadow-md min-h-[12rem] min-w-[10rem] bg-primary px-1"
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

      {/* Dialog for image files only */}
      {!isPdf && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            {/* Dialog Trigger is automatically handled */}
          </DialogTrigger>
          <DialogContent
            onInteractOutside={handleCloseModal}
            className="bg-background p-10 rounded-lg shadow-lg w-auto max-w-[90%] h-auto max-h-[90%] flex items-center justify-center"
          >
            <div className="relative">
              <Image
                src={imageUrl}
                alt="Business License Full View"
                width={750}
                height={750}
                className="max-w-[750px] max-h-[750px] object-contain rounded-lg shadow-md"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BusinessLicense;
