import React from "react";
import { Card, CardTitle } from "@/components/ui/card";

export default function VariantDetails({ product }) {
  const handleDeleteImage = (variantId, imageId) => {
    // Implement the logic for deleting an image
    console.log(`Delete image with id ${imageId} from variant ${variantId}`);
  };

  const handleUploadImage = (variantId) => {
    // Implement the logic for uploading a new image
    console.log(`Upload new image for variant ${variantId}`);
  };

  if (!product || !product.ProductVariants) {
    return (
      <Card className="p-5">
        <CardTitle className="text-2xl">Product Variants</CardTitle>
        <p>No product variants available</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <CardTitle className="text-2xl">Product Variants</CardTitle>
      <div className="space-y-6">
        {product.ProductVariants.map((variant) => (
          <div
            key={variant.id}
            className="border p-4 rounded-lg space-y-4 shadow-md"
          >
            <div>
              <h3 className="text-xl font-semibold">
                Variant ID: {variant.productVariantNo}
              </h3>
              <p className="text-sm text-gray-600">
                Price: ${variant.price}
              </p>
              <p className="text-sm text-gray-600">
                Color: {variant.Color?.name || "Unknown"}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Images</h4>
              <div className="flex flex-wrap gap-4">
                {variant.ProductVariantImages.map((image) => (
                  <div key={image.id} className="space-y-2">
                    <img
                      src={image.imageUrl}
                      alt="Variant Image"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      onClick={() =>
                        handleDeleteImage(variant.id, image.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <button
                  className="px-3 py-2 bg-blue-500 text-white rounded"
                  onClick={() => handleUploadImage(variant.id)}
                >
                  Upload Image
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold">Sizes & Quantities</h4>
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Size</th>
                    <th className="border p-2 text-left">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {variant.ProductVariantSizes.map((size) => (
                    <tr key={size.id}>
                      <td className="border p-2">
                        {size.Size?.name} ({size.Size?.abbreviation})
                      </td>
                      <td className="border p-2">{size.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
