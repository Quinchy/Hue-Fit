// AddProduct.js
import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoveLeft, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductVariantCard from "../components/product-variant-card";
import Image from "next/image";
import { Label } from "@/components/ui/label";

export default function AddProduct() {
  const router = useRouter();
  const [variants, setVariants] = useState([
    { id: 1, size: "Small", quantity: "", measurements: [] },
  ]);

  const addVariant = () => {
    const newVariant = { id: variants.length + 1, size: "", quantity: "", measurements: [] };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId) => {
    setVariants((prevVariants) => prevVariants.filter((variant) => variant.id !== variantId));
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

  const handleMeasurementChange = (variantId, index, field, value) => {
    const updatedVariants = variants.map((variant) => {
      if (variant.id === variantId) {
        const updatedMeasurements = [...variant.measurements];
        updatedMeasurements[index][field] = value;
        return { ...variant, measurements: updatedMeasurements };
      }
      return variant;
    });
    setVariants(updatedVariants);
  };

  const handleUnitSelect = (variantId, index, unit) => {
    handleMeasurementChange(variantId, index, "unit", unit);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex justify-between items-center mb-5">
        <CardTitle className="text-4xl">Add Product</CardTitle>
        <Button variant="outline" onClick={() => router.push('/dashboard/product')}>
          <MoveLeft className="scale-125" />
          Back to Products
        </Button>
      </div>

      <div className="flex gap-5 mb-10">
        <div className="flex flex-col items-center gap-5">
          <div className="bg-accent rounded border-8 border-card">
            <Image src="/images/placeholder-picture.png" alt="Profile" width={320} height={320} className="max-w-[30rem]" />
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="scale-110 stroke-[3px] mr-2" />
            Add Thumbnail
          </Button>
        </div>
        <Card className="flex-1 p-5">
          <CardTitle className="text-2xl">Product Information</CardTitle>
          <div className="mb-4">
            <Label className="font-bold">Description</Label>
            <Input variant="textarea" placeholder="Enter a description about the product" />
          </div>
          <div className="mb-4">
            <label className="block font-semibold">Clothing Type</label>
            <Select>
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Select an outfit category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="upperwear">Upper Wear</SelectItem>
                  <SelectItem value="lowerwear">Lower Wear</SelectItem>
                  <SelectItem value="footwear">Foot Wear</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div className="mb-5 flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[14rem]">Product Variants</CardTitle>
        <div className="h-[1px] w-full bg-primary/25"></div>
      </div>

      {variants.map((variant) => (
        <ProductVariantCard
          key={variant.id}
          variant={variant}
          onAddMeasurement={addMeasurement}
          onMeasurementChange={(index, field, value) => handleMeasurementChange(variant.id, index, field, value)}
          onUnitSelect={(index, unit) => handleUnitSelect(variant.id, index, unit)}
          onRemove={() => removeVariant(variant.id)} // Pass the remove function
        />
      ))}

      <Button variant="outline" className="w-full mt-4" onClick={addVariant}>
        <Plus className="scale-110 stroke-[3px]" />
        Add Product Variant
      </Button>

      <Button variant="default" className="w-full mt-4 mb-20">
        Submit
      </Button>
    </DashboardLayoutWrapper>
  );
}
