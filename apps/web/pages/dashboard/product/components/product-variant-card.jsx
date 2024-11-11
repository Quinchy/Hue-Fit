// product-variant-card.jsx
import { useState } from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpecificMeasurement from './specific-measurement';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';

export default function ProductVariantCard({ variant, onAddMeasurement, onMeasurementChange, onUnitSelect, onRemove }) {
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Size labels with the desired fixed ordering
  const sizeLabels = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double Extra Large',
  };

  // Function to toggle a size, maintaining fixed order
  const toggleSize = (size) => {
    setSelectedSizes((prevSelected) => {
      const isSelected = prevSelected.includes(size);
      const updatedSizes = isSelected
        ? prevSelected.filter((s) => s !== size) // Remove if selected
        : [...prevSelected, size]; // Add if not selected
      
      // Sort based on fixed size order defined in sizeLabels
      return Object.keys(sizeLabels).filter((key) => updatedSizes.includes(key));
    });
  };

  return (
    <div className="flex gap-5 mb-5">
      <div className="flex flex-col items-center gap-5">
        <div className="bg-accent rounded border-8 border-card">
          <Image src="/images/placeholder-picture.png" alt="Product" width={320} height={320} className="max-w-[30rem]" />
        </div>
        <Button variant="outline" className="w-full">
          <Plus className="scale-110 stroke-[3px] mr-2" />
          Add Picture
        </Button>
      </div>
      <Card className="flex-1 p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Product Variant Information</CardTitle>
          <Button variant="ghost" className="text-red-500 p-5 hover:bg-red-500 min-w-[3rem] min-h-[3rem]" onClick={onRemove}>
            <Trash2 className="scale-110 stroke-[2px]" />
          </Button>
        </div>
        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter the product name" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Label htmlFor="price">Price</Label>
            <Input id="price" placeholder="Enter the price" />
          </div>
          <div className="flex-1">
            <Label htmlFor="color">Color</Label>
            <Input id="color" placeholder="Select or enter a color in hex" />
          </div>
        </div>

        <div className="mb-4">
          <Label>Size</Label>
          <ToggleGroup type="multiple" className="flex justify-start gap-2">
            {Object.keys(sizeLabels).map((size) => (
              <ToggleGroupItem
                key={size}
                value={size}
                variant="outline"
                selected={selectedSizes.includes(size)}
                onClick={() => toggleSize(size)}
                className="min-w-14 min-h-14 border-2"
              >
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Render SpecificMeasurement components for selected sizes in fixed order */}
        {selectedSizes.map((size) => (
          <SpecificMeasurement key={size} title={sizeLabels[size]} />
        ))}
      </Card>
    </div>
  );
}
