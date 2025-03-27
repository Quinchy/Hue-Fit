// pages/dashboard/measurement/components/edit-measurement.js
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { addMeasurementSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { CardTitle } from "@/components/ui/card";

export default function EditMeasurementDialog({ measurement = {}, isOpen, onOpenChange, onMeasurementEdited, types = [] }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: measurement.name || "",
      assignTo: measurement.assignTo || "",
    },
    validationSchema: addMeasurementSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/measurements/update-measurement", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: measurement.id, name: values.name, assignTo: values.assignTo }),
        });
        if (response.ok) {
          onMeasurementEdited && onMeasurementEdited("Measurement edited successfully.", "success");
          resetForm();
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          onMeasurementEdited && onMeasurementEdited(errorData.error || "Failed to edit measurement.", "error");
        }
      } catch (error) {
        console.error("Error editing measurement:", error);
        onMeasurementEdited && onMeasurementEdited("An unexpected error occurred.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen, formik]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Edit Measurement</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex items-center">
              Measurement Name <Asterisk className="w-4 h-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter measurement name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.name, formik.touched.name)}
            />
            <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assignTo" className="font-bold flex items-center">
              Assign to <Asterisk className="w-4 h-4" />
            </Label>
            <Select
              id="assignTo"
              onValueChange={(value) => formik.setFieldValue("assignTo", value)}
              value={formik.values.assignTo}
              disabled={loading}
            >
              <SelectTrigger className={InputErrorStyle(formik.errors.assignTo, formik.touched.assignTo)}>
                <SelectValue placeholder="Select a clothing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputErrorMessage error={formik.errors.assignTo} touched={formik.touched.assignTo} />
          </div>

          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Saving..." /> : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-1/2">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
