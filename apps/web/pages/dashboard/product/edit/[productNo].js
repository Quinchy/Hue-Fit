import { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EditProduct() {
  const router = useRouter();
  const [variants, setVariants] = useState([
    { id: 1, size: "Small", quantity: 20, measurements: [{ context: "Chest", value: 36, unit: "Inch" }] },
    { id: 2, size: "Medium", quantity: 10, measurements: [{ context: "Chest", value: 38, unit: "Inch" }] },
    { id: 3, size: "Large", quantity: 15, measurements: [{ context: "Chest", value: 40, unit: "Inch" }] },
  ]);

  const addVariant = () => {
    const newVariant = { id: variants.length + 1, size: "", quantity: "", measurements: [] };
    setVariants([...variants, newVariant]);
  };

  const addMeasurement = (variantId) => {
    const updatedVariants = variants.map((variant) => {
      if (variant.id === variantId) {
        return {
          ...variant,
          measurements: [...variant.measurements, { context: "", value: "", unit: "" }],
        };
      }
      return variant;
    });
    setVariants(updatedVariants);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Edit Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          ← Back to Products
        </Button>
      </div>

      <div className="flex gap-5 mb-10">
        <div className="w-1/4 flex flex-col items-center">
          <img src="/path/to/default-thumbnail.png" alt="Product Thumbnail" className="h-32 w-32 object-cover rounded mb-3" />
          <Button variant="outline">+ Add Thumbnail</Button>
        </div>
        <Card className="flex-1 p-5">
          <h2 className="font-semibold text-lg mb-4">Product Information</h2>
          <div className="mb-4">
            <label className="block font-semibold">Description</label>
            <Input placeholder="A comfortable and stylish upper wear ideal for casual outings. Made with premium cotton for breathability and durability." />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Clothing Type</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  Upperwear
                  <ChevronDown className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Upper Wear</DropdownMenuItem>
                  <DropdownMenuItem>Lower Wear</DropdownMenuItem>
                  <DropdownMenuItem>Foot Wear</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      <div className="mb-5">
        <CardTitle className="text-2xl">Product Variant</CardTitle>
      </div>

      {variants.map((variant) => (
        <div key={variant.id} className="flex gap-5 mb-5">
          <div className="w-1/4 flex flex-col items-center">
            <img src="/path/to/variant-image.png" alt="Variant Image" className="h-32 w-32 object-cover rounded mb-3" />
            <Button variant="outline">+ Add More</Button>
          </div>
          <Card className="flex-1 p-5">
            <h2 className="font-semibold text-lg mb-4">Product Variant Information</h2>
            <div className="mb-4">
              <label className="block font-semibold">Name</label>
              <Input placeholder="Blue Classic Cotton T-Shirt" />
            </div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold">Price</label>
                <Input placeholder="₱415" />
              </div>
              <div className="flex-1">
                <label className="block font-semibold">Color</label>
                <Input placeholder="#5494BB" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold">Size</label>
              <div className="flex gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <Button key={size} variant="outline" className="px-4">{size}</Button>
                ))}
              </div>
            </div>

            <h3 className="font-semibold text-lg mt-4 mb-2">Specific Measurements</h3>
            {variant.measurements.map((measurement, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <Input placeholder={measurement.context} className="flex-1" />
                <Input placeholder={measurement.value} className="flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 justify-between">
                      {measurement.unit}
                      <ChevronDown className="ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Inch</DropdownMenuItem>
                      <DropdownMenuItem>cm</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <Button variant="ghost" className="w-full mt-2" onClick={() => addMeasurement(variant.id)}>
              + Add Specific Measurements
            </Button>
          </Card>
        </div>
      ))}

      <div className="flex flex-col items-center mb-4">
        <Button variant="outline" className="w-3/4" onClick={addVariant}>
          + Add More Variant
        </Button>
      </div>

      <div className="flex flex-col items-center mb-10">
        <Button variant="default" className="w-3/4">
          Update
        </Button>
      </div>
    </DashboardLayoutWrapper>
  );
}
