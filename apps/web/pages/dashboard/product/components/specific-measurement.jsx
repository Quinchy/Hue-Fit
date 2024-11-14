// specific-measurement.jsx
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';

export default function SpecificMeasurement({ title, onRemove }) {
  const [measurements, setMeasurements] = useState([{ context: '', value: '', unit: '' }]);

  const handleAddMeasurement = () => {
    setMeasurements([...measurements, { context: '', value: '', unit: '' }]);
  };

  const handleRemoveMeasurement = (index) => {
    const updatedMeasurements = measurements.filter((_, i) => i !== index);
    setMeasurements(updatedMeasurements);
  };

  return (
    <div className="border-t-2 border-t-border border-dashed py-4 mt-4">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="mb-4">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" type="number" placeholder="Enter quantity" />
      </div>
      {measurements.map((measurement, index) => (
        <div key={index} className="flex flex-row mb-5 gap-3 items-center">
          <div className="flex-1">
            <Label>Measurement</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select specific measurement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shoulder">SHOULDER</SelectItem>
                <SelectItem value="bust">BUST</SelectItem>
                <SelectItem value="cuff">CUFF</SelectItem>
                <SelectItem value="sleeve">SLEEVE</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value="inch">INCH</SelectItem>
                <SelectItem value="cm">CM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            className="text-red-500 p-2 mt-5"
            onClick={() => handleRemoveMeasurement(index)}
          >
            <Trash2 className="scale-90 stroke-[2px]" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full mt-2" onClick={handleAddMeasurement}>
        <Plus className="scale-110 stroke-[3px]" /> Add Specific Measurement
      </Button>
    </div>
  );
}
