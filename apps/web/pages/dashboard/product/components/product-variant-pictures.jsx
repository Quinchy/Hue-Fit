// components/ProductVariantPictures.jsx
import { useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function ProductVariantPictures() {
  const [images, setImages] = useState([]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`; // Unique ID for each image based on name and timestamp
      setImages((prevImages) => [...prevImages, { id: uniqueId, url: imageUrl }]);
    }
  };

  // Handle image removal
  const handleRemoveImage = (id) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <Label>Product Variant Pictures</Label>
      <div className="overflow-x-auto">
        <div className="flex gap-5 w-max">
          {images.map((image, index) => (
            <div key={image.id} className="relative bg-accent rounded border-8 border-border w-[320px] h-[320px] overflow-hidden mb-5">
              <Image src={image.url} alt={`Product Image ${index + 1}`} width={320} height={320} className="object-contain w-full h-full" />
              <button
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded shadow-accent shadow-sm hover:bg-red-700"
                aria-label="Remove Image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <label
            className="flex flex-col items-center text-primary/25 justify-center w-[320px] h-[320px] border-4 rounded-lg border-dashed cursor-pointer"
          >
            <Plus className="scale-110 stroke-[3px] mr-2" />
            <p className="text-xl font-semibold">Add Picture</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
