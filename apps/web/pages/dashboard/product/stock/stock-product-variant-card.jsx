// components/StockProductVariantCard.jsx

import { useState } from "react";
import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, MoveRight } from "lucide-react";

export default function StockProductVariantCard({
  variant,
  variantIndex,
  sizes,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantities, setQuantities] = useState(
    variant.ProductVariantSize.reduce((acc, vq) => {
      acc[vq.Size.abbreviation] = vq.quantity;
      return acc;
    }, {})
  );
  const [increments, setIncrements] = useState(
    variant.ProductVariantSize.reduce((acc, vq) => {
      acc[vq.Size.abbreviation] = 0;
      return acc;
    }, {})
  );

  // Handle increment input change for a specific size
  const handleIncrementChange = (sizeAbbr, value) => {
    if (!isEditing) return;
    const parsedValue = parseInt(value, 10);
    setIncrements((prev) => ({
      ...prev,
      [sizeAbbr]: isNaN(parsedValue) ? 0 : parsedValue,
    }));
  };

  // Handle update action
  const handleUpdate = () => {
    // Update quantities with increments
    const updatedQuantities = { ...quantities };
    Object.keys(increments).forEach((sizeAbbr) => {
      updatedQuantities[sizeAbbr] += increments[sizeAbbr];
    });
    setQuantities(updatedQuantities);
    setIncrements(
      variant.ProductVariantSize.reduce((acc, vq) => {
        acc[vq.Size.abbreviation] = 0;
        return acc;
      }, {})
    );
    setIsEditing(false);
    // TODO: Persist the updated quantities via API call
  };

  // Handle cancel action
  const handleCancel = () => {
    // Reset increments to zero
    setIncrements(
      variant.ProductVariantSize.reduce((acc, vq) => {
        acc[vq.Size.abbreviation] = 0;
        return acc;
      }, {})
    );
    setIsEditing(false);
  };

  // Get the variant color name
  const variantColor = variant.Color?.name || "N/A";

  // Get the variant image URL (use the first image or a placeholder)
  const variantImageURL =
    variant.ProductVariantImage?.[0]?.imageURL ||
    "/images/placeholder-picture.png";

  // Sort variant sizes based on the order of 'sizes' prop
  const sortedVariantSizes = sizes
    .map((size) =>
      variant.ProductVariantSize.find(
        (vq) => vq.Size.abbreviation === size.abbreviation
      )
    )
    .filter(Boolean);

  return (
    <Card className="flex flex-col p-5 gap-5">
      {/* Main Content Section */}
      <div className="flex flex-row gap-5">
        {/* Left Column: Thumbnail Image */}
        <div className="w-72 h-72 relative">
          <Image
            src={variantImageURL}
            alt={`Variant ${variantIndex + 1} Thumbnail`}
            fill
            objectFit="cover"
            className="rounded"
            priority
          />
        </div>

        {/* Right Column: Quantities for Each Available Size */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Header Section with Variant Color and Edit Button */}
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">
              {variantColor}
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Edit Quantities"
              disabled={isEditing}
            >
              <Pencil className="scale-125" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {sortedVariantSizes.map((vq) => {
              const sizeAbbr = vq.Size.abbreviation;
              const sizeObj = sizes.find((sz) => sz.abbreviation === sizeAbbr);

              // If size is not found in the sizes list, skip rendering
              if (!sizeObj) return null;

              return (
                <div key={sizeAbbr} className="flex flex-col gap-1">
                  <Label className="font-bold">
                    {sizeObj.name} ({sizeObj.abbreviation})
                  </Label>
                  {!isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      value={quantities[sizeAbbr] || 0}
                      disabled
                      className="w-1/3"
                    />
                  ) : (
                    <div className="flex flex-row items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <Label className="uppercase text-sm text-primary/80">Add Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={increments[sizeAbbr] || ""}
                          onChange={(e) =>
                            handleIncrementChange(sizeAbbr, e.target.value)
                          }
                          placeholder="Amount to add"
                          className="w-full"
                        />
                      </div>
                      <p className="mt-5"><MoveRight /></p>
                      <div className="flex flex-col gap-1">
                        <Label className="uppercase text-sm text-primary/80">In Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={
                            (quantities[sizeAbbr] || 0) + (increments[sizeAbbr] || 0)
                          }
                          disabled
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Update and Cancel Buttons Below the Size List */}
          {isEditing && (
            <div className="flex flex-col gap-2 mt-5">
              <Button
                variant="default"
                onClick={handleUpdate}
                aria-label="Update Quantities"
                className="flex items-center gap-1"
              >
                Update
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                aria-label="Cancel Editing"
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
