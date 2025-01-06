// pages/colors/components/edit-color.jsx

import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { addColorSchema as editColorSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function EditColorDialog({ color = {}, isOpen, onOpenChange, onColorUpdated }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: color.name || "", hexCode: color.hexcode || "#000000" },
    validationSchema: editColorSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/colors/update-color", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: color.id, ...values }),
        });

        if (response.ok) {
          onColorUpdated && onColorUpdated("Color updated successfully.", "success");
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          onColorUpdated && onColorUpdated(errorData.error || "Failed to update color.", "error");
        }
      } catch (error) {
        onColorUpdated && onColorUpdated("An unexpected error occurred.", "error");
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
          <CardTitle className="text-2xl">Edit Color</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex items-center">
                Name <Asterisk className="w-4 h-4 text-red-500" />
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter the Color name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hexCode" className="font-bold flex items-center">
                Hex Code <Asterisk className="w-4 h-4 text-red-500" />
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="hexCode"
                  type="color"
                  name="hexCode"
                  value={formik.values.hexCode}
                  onChange={formik.handleChange}
                  className="w-12 h-12 border-none bg-transparent p-0"
                />
                <Input
                  name="hexCode"
                  placeholder="#000000"
                  value={formik.values.hexCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-[25.4rem] ${InputErrorStyle(formik.errors.hexCode, formik.touched.hexCode)}`}
                />
              </div>
              <InputErrorMessage error={formik.errors.hexCode} touched={formik.touched.hexCode} />
            </div>
          </div>
          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Saving..." /> : "Save"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-1/2">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
