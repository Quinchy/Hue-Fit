// edit-product-variant-pictures.jsx
import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function EditProductVariantPictures({ variantImages, isEditing }) {
  // Initialize local state with existing server images.
  // Map server's "imageURL" to local "url" so the rest of code works uniformly.
  const [images, setImages] = useState(
    (variantImages || []).map((img) => ({
      ...img,
      url: img.imageURL || "", // fallback to imageURL from server
    }))
  );

  const handleImageUpload = (e) => {
    if (!isEditing) return;
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`;
      const newImage = { id: uniqueId, file, url: imageUrl };
      setImages((prev) => [...prev, newImage]);
    }
  };

  const handleRemoveImage = (id) => {
    if (!isEditing) return;
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <Label className="font-bold">Product Variant Pictures</Label>
      <div className="overflow-x-auto">
        <div className="flex gap-3 w-max">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative bg-accent rounded border-8 border-border w-[320px] h-[320px] overflow-hidden mb-5"
            >
              <Image
                src={image.url || "/images/placeholder-picture.png"}
                alt={`Product Image ${index + 1}`}
                width={320}
                height={320}
                className="object-contain w-full h-full"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded hover:bg-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <label className="flex flex-col items-center text-primary/25 justify-center w-[320px] h-[320px] border-4 rounded-lg border-dashed cursor-pointer">
              <Plus className="scale-110 stroke-[3px] mr-2" />
              <p className="text-xl font-semibold">Add Picture</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
