import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useFormikContext } from "formik";
import {
  InputErrorStyle,
  InputErrorMessage,
} from "@/components/ui/error-message";

export default function ProductVariantPictures({ variantIndex }) {
  const { values, errors, touched, setFieldValue } = useFormikContext() || {};
  const images = values?.variants?.[variantIndex]?.images || [];

  // Extract error and touched info for this field.
  const fieldError = errors?.variants?.[variantIndex]?.images;
  const fieldTouched = touched?.variants?.[variantIndex]?.images;

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`;
      const newImage = { id: uniqueId, file, url: imageUrl };
      const updatedImages = [...images, newImage];
      setFieldValue(`variants.${variantIndex}.images`, updatedImages);
    }
  };

  const handleRemoveImage = (id) => {
    const updatedImages = images.filter((image) => image.id !== id);
    setFieldValue(`variants.${variantIndex}.images`, updatedImages);
  };

  return (
    <div className="flex flex-col min-w-full max-w-[71rem] gap-2">
      <Label className="font-bold flex flex-row items-center">
        Product Variant Pictures <Asterisk className="w-4" />
      </Label>
      {/* Wrap the image container with error style */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 w-max">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className="relative bg-accent rounded border-2 border-border w-[320px] h-[320px] overflow-hidden mb-5"
            >
              <Image
                src={image.url}
                alt={`Product Image ${idx + 1}`}
                width={320}
                height={320}
                className="object-contain w-full h-full"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded shadow-accent shadow-sm hover:bg-red-700"
                aria-label="Remove Image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <label
            className={`flex flex-col items-center text-primary/25 justify-center w-[320px] h-[320px] border-2 rounded-lg border-dashed cursor-pointer ${InputErrorStyle(
              fieldError,
              fieldTouched
            )}`}
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
