// edit-product-variant-card.jsx
import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import EditProductVariantPictures from "./edit-product-variant-pictures";

function orderSizes(sizes) {
  const sizeMap = new Map();
  const nextIds = new Set();
  sizes.forEach((size) => {
    sizeMap.set(size.id, size);
    if (size.nextId !== null) {
      nextIds.add(size.nextId);
    }
  });
  const startIds = sizes.map((size) => size.id).filter((id) => !nextIds.has(id));
  const orderedSizes = [];
  startIds.forEach((startId) => {
    let currentSize = sizeMap.get(startId);
    const visited = new Set();
    while (currentSize && !visited.has(currentSize.id)) {
      orderedSizes.push(currentSize);
      visited.add(currentSize.id);
      currentSize = sizeMap.get(currentSize.nextId);
    }
  });
  return orderedSizes;
}

export default function EditProductVariantCard({
  variant,
  variantIndex,
  colors,
  sizes
}) {
  const [isEditingVariant, setIsEditingVariant] = useState(false);

  const variantImages = variant.ProductVariantImage || [];
  const variantQuantities = variant.ProductVariantSize || [];
  const sortedSizes = orderSizes(sizes);

  const handlePriceChange = (e) => {
    if (!isEditingVariant) return;
    variant.price = e.target.value;
  };

  const handleColorChange = (val) => {
    if (!isEditingVariant) return;
    const found = colors.find((c) => c.name === val);
    if (found) {
      variant.Color = found;
    }
  };

  const handleQuantityChange = (vq, newValue) => {
    if (!isEditingVariant) return;
    vq.quantity = newValue;
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex-1 flex flex-col p-5 gap-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Product Variant - {variantIndex + 1}</CardTitle>
          {!isEditingVariant && (
            <Button
              variant="ghost"
              className="w-14 h-14"
              onClick={() => setIsEditingVariant(true)}
            >
              <Pencil className="scale-125" />
            </Button>
          )}
        </div>
        <EditProductVariantPictures
          variantImages={variantImages}
          isEditing={isEditingVariant}
        />
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label className="font-bold">Price</Label>
            <Input
              placeholder="Enter a price for the product"
              value={variant.price || ""}
              disabled={!isEditingVariant}
              onChange={handlePriceChange}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label className="font-bold">Color</Label>
            <Select
              disabled={!isEditingVariant}
              value={variant.Color?.name || ""}
              onValueChange={handleColorChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color of the product" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.name}>
                    <div className="flex flex-row items-center gap-2">
                      <span
                        className="p-2 rounded"
                        style={{ backgroundColor: color.hexcode }}
                      />
                      {color.name.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-row flex-wrap gap-3">
          {variantQuantities.map((vq, idx) => {
            const abbr = vq.Size?.abbreviation || "";
            const sizeObj = sortedSizes.find((sz) => sz.abbreviation === abbr);
            return (
              <div key={`${abbr}-${idx}`} className="min-w-[180px] flex flex-col gap-1">
                <Label className="font-bold">
                  Quantity for {sizeObj?.name || abbr}
                </Label>
                <Input
                  placeholder="Enter quantity"
                  value={vq.quantity || ""}
                  disabled={!isEditingVariant}
                  onChange={(e) => handleQuantityChange(vq, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        {isEditingVariant && (
          <div className="flex flex-col gap-2 mt-10">
            <Button variant="default" onClick={() => setIsEditingVariant(false)}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditingVariant(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
