import { useState } from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpecificMeasurement from './specific-measurement';
import ProductVariantPictures from './product-variant-pictures';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProductVariantCard({ variant, onAddMeasurement, onMeasurementChange, onUnitSelect, onRemove }) {
  const [selectedSizes, setSelectedSizes] = useState([]);
  const { data: productData } = useSWR('/api/products/get-product-related-info', fetcher);

  if (!productData) return null;

  const { colors, sizes } = productData;
  console.log('colors:', colors);

  // Function to toggle a size, maintaining fixed order
  const toggleSize = (size) => {
    setSelectedSizes((prevSelected) => {
      const isSelected = prevSelected.includes(size);
      const updatedSizes = isSelected
        ? prevSelected.filter((s) => s !== size)
        : [...prevSelected, size];
      return updatedSizes;
    });
  };

  return (
    <div className="flex flex-col gap-5 mb-5">
      <ProductVariantPictures />
      <Card className="flex-1 p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Product Variant Information</CardTitle>
          <Button variant="ghost" className="text-red-500 p-5 hover:bg-red-500 min-w-[3rem] min-h-[3rem]" onClick={onRemove}>
            <Trash2 className="scale-110 stroke-[2px]" />
          </Button>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <Label htmlFor="price">Price</Label>
            <Input id="price" placeholder="Enter the price" />
          </div>
          <div className="flex-1">
            <Label htmlFor="color">Color</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.name}>
                    <div className="flex flex-row items-center gap-2">
                      <p className="p-2 rounded" style={{ backgroundColor: color.hexcode }}></p>
                      {color.name.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <Label>Size</Label>
          <ToggleGroup type="multiple" className="flex justify-start gap-2">
            {sizes.map((size) => (
              <ToggleGroupItem
                key={size.id}
                value={size.abbreviation}
                variant="outline"
                selected={selectedSizes.includes(size.abbreviation)}
                onClick={() => toggleSize(size.abbreviation)}
                className="min-w-14 min-h-14 border-2"
              >
                {size.abbreviation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Render SpecificMeasurement components for selected sizes in fixed order */}
        {selectedSizes.map((size) => (
          <SpecificMeasurement key={size} title={size} />
        ))}
      </Card>
    </div>
  );
}
