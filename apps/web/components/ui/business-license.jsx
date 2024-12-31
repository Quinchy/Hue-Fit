import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';

const BusinessLicense = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isPdf = imageUrl.toLowerCase().endsWith('.pdf');
  const placeholderImage = '/images/placeholder-pdf.png'; // Fallback if PDF preview fails

  useEffect(() => {
    const generatePreview = async () => {
      try {
        const fileBlob = await fetch(imageUrl).then((res) => res.blob());
        const objectUrl = URL.createObjectURL(fileBlob);
        setPreviewUrl(objectUrl);
      } catch (error) {
        console.error('Error generating preview:', error);
        setPreviewUrl(placeholderImage);
      }
    };

    generatePreview();
  }, [imageUrl]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Render preview for images or PDFs */}
      {isPdf ? (
        <div className="relative w-[10rem] h-[12rem] rounded shadow-md border-2 border-primary/50 border-dashed p-2">
          <embed
            src={previewUrl || placeholderImage}
            type="application/pdf"
            className="w-full h-full rounded"
          />
          {/* Invisible button positioned over the PDF */}
          <button
            type='button'
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 w-full min-h-[12rem] bg-transparent cursor-pointer"
            aria-label="Open PDF Modal"
          ></button>
        </div>
      ) : (
        <div className="relative">
          <Image
            src={previewUrl || placeholderImage}
            alt="Business License"
            width={128}
            height={128}
            quality={100}
            onClick={() => setIsModalOpen(true)} // Open modal for images
            className="cursor-pointer object-cover rounded shadow-md min-h-[12rem] min-w-[10rem] border-2 border-primary/50 border-dashed p-2"
          />
        </div>
      )}

      {/* Dialog for PDFs and images */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          {/* No explicit trigger needed */}
        </DialogTrigger>
        <DialogContent
          onInteractOutside={handleCloseModal}
          className="fixed bg-transparent border-none p-20 flex items-center justify-center min-w-full h-full "
        >
          <div className="w-screen h-full flex justify-center items-center">
            {isPdf ? (
              <iframe
                src={previewUrl || placeholderImage}
                width="100%"
                height="100%"
                title="PDF Viewer"
              />
            ) : (
              <Image
                src={imageUrl}
                alt="Business License Full View"
                width={1250}
                height={1250}
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessLicense;
