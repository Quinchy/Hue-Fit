// specific-measurement.jsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';

export default function SpecificMeasurement({ title }) {
  const [measurements, setMeasurements] = useState([{ context: '', value: '', unit: '' }]);

  const handleAddMeasurement = () => {
    setMeasurements([...measurements, { context: '', value: '', unit: '' }]);
  };

  return (
    <div className="border-t-2 border-t-border border-dashed py-4 mt-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="mb-4">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" placeholder="Enter quantity" />
      </div>
      {measurements.map((measurement, index) => (
        <div key={index} className="flex gap-3 mb-3">
          <div className="flex-1">
            <Label>Context</Label>
            <Input placeholder="Context (e.g., Chest)" />
          </div>
          <div className="flex-1">
            <Label>Value</Label>
            <Input placeholder="Value" />
          </div>
          <div className="flex-1">
            <Label>Unit</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inch">Inch</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
      <Button variant="outline" className="w-full mt-2"  onClick={handleAddMeasurement}>
        <Plus className="scale-110 stroke-[3px]" /> Add Specific Measurement
      </Button>
    </div>
  );
}
