// edit-specific-measurements.jsx
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditSpecificMeasurements({ product, setProduct }) {
  const [isEditingMeasure, setIsEditingMeasure] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (product && product.ProductMeasurement) {
      const grouped = {};
      product.ProductMeasurement.forEach((pm) => {
        const key = pm.Measurement?.name || "";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(pm);
      });
      const prepared = Object.entries(grouped).map(([measurementName, items]) => ({
        measurementName,
        values: items.map((i) => ({
          size: i.Size?.abbreviation || "",
          value: i.value || ""
        }))
      }));
      setRows(prepared);
    }
  }, [product]);

  const selectedSizes = product?.sizes || [];

  const handleValueChange = (rowIndex, sizeAbbr, val) => {
    if (!isEditingMeasure) return;
    setRows((prev) => {
      const updated = [...prev];
      const targetRow = updated[rowIndex];
      const foundValue = targetRow.values.find((v) => v.size === sizeAbbr);
      if (foundValue) {
        foundValue.value = val;
      }
      return updated;
    });
  };

  return (
    <Card className="flex flex-col p-5">
      <div className="flex justify-end items-center mb-3">
        <Button
          variant="ghost"
          className="w-14 h-14"
          onClick={() => setIsEditingMeasure(true)}
          disabled={isEditingMeasure}
        >
          <Pencil className="scale-125" />
        </Button>
      </div>

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="border px-4 py-2 text-left">Measurement</TableHead>
            {selectedSizes.map((sz) => (
              <TableHead key={sz} className="border px-4 py-2 text-left">
                {sz}
              </TableHead>
            ))}
            <TableHead className="border px-4 py-2"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="border px-4 py-2">
                <Input
                  disabled={!isEditingMeasure}
                  value={row.measurementName}
                  onChange={(e) => {
                    if (!isEditingMeasure) return;
                    const newVal = e.target.value;
                    setRows((prev) => {
                      const updated = [...prev];
                      updated[rowIndex].measurementName = newVal;
                      return updated;
                    });
                  }}
                />
              </TableCell>
              {selectedSizes.map((sz) => {
                const foundVal = row.values.find((v) => v.size === sz) || {};
                return (
                  <TableCell key={sz} className="border px-4 py-2">
                    <Input
                      placeholder="Value in CM"
                      disabled={!isEditingMeasure}
                      value={foundVal.value || ""}
                      onChange={(e) => handleValueChange(rowIndex, sz, e.target.value)}
                    />
                  </TableCell>
                );
              })}
              <TableCell className="border min-w-14 max-w-14 text-center">
                {isEditingMeasure && (
                  <Button
                    variant="ghost"
                    type="button"
                    className="text-red-500 hover:bg-red-500 w-10"
                    onClick={() => {
                      setRows((prev) => {
                        const updated = [...prev];
                        updated.splice(rowIndex, 1);
                        return updated;
                      });
                    }}
                  >
                    <Trash2 className="scale-110 stroke-[2px]" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isEditingMeasure && (
        <>
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              const newRow = {
                measurementName: "",
                values: selectedSizes.map((sz) => ({ size: sz, value: "" }))
              };
              setRows((prev) => [...prev, newRow]);
            }}
          >
            <Plus className="mr-2" /> Add Measurement
          </Button>
          <div className="flex flex-col gap-2 mt-10">
            <Button variant="default" onClick={() => setIsEditingMeasure(false)}>
              Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditingMeasure(false)}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
