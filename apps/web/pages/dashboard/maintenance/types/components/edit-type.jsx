// pages/dashboard/maintenance/types/components/edit-type.js

import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { addTypeSchema as editTypeSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function EditTypeDialog({ type = {}, isOpen, onOpenChange, onEdit }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: type.name || "" },
    validationSchema: editTypeSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/types/update-type", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: type.id, ...values }),
        });

        if (response.ok) {
          onEdit && onEdit("Type updated successfully.", "success");
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          onEdit && onEdit(errorData.error || "Failed to update type.", "error");
        }
      } catch (error) {
        onEdit && onEdit("An unexpected error occurred.", "error");
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
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Edit Type</CardTitle>
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
                placeholder="Enter the type name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
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
