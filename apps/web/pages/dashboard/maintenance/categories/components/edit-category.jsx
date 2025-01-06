// pages/categories/components/edit-category.jsx
import { useFormik } from "formik";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { InputErrorStyle, InputErrorMessage } from "@/components/ui/error-message";
import { addCategorySchema } from "@/utils/validation-schema";
import { CardTitle } from "@/components/ui/card";
import { LoadingMessage } from "@/components/ui/loading-message";
import { useState, useEffect } from "react";

export default function EditCategoryDialog({ category, isOpen, onOpenChange, onCategoryUpdated }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: category?.name || "" },
    validationSchema: addCategorySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch(`/api/maintenance/categories/update-category`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: category.id, name: values.name }), // Pass id in payload
        });

        if (response.ok) {
          onCategoryUpdated("Category updated successfully.", "success");
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          onCategoryUpdated(errorData.error || "Failed to update category.", "error");
        }
      } catch {
        onCategoryUpdated("An unexpected error occurred.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Edit Category</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex items-center">
              Category Name <Asterisk className="w-4 h-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formik.values.name}
              onChange={(e) => {
                formik.handleChange(e);
              }}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.name, formik.touched.name)}
            />
            <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
          </div>
          <DialogFooter className="mt-10 flex gap-2">
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
