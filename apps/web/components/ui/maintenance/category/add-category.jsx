import { useState, useEffect } from "react";
import { useFormik } from "formik";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  InputErrorStyle,
  InputErrorMessage,
} from "@/components/ui/error-message";
import { addCategorySchema } from "@/utils/validation-schema";
import { CardTitle } from "@/components/ui/card";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddCategoryDialog({
  buttonClassName = "",
  buttonName = "Add Category",
  onAdd,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: addCategorySchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/maintenance/categories/add-category",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }
        );
        if (response.ok) {
          onAdd("Category added successfully.", "success", "Success");
          resetForm();
          setIsDialogOpen(false);
        } else {
          const errorData = await response.json();
          onAdd(errorData.error || "Failed to add category.", "error", "Error");
        }
      } catch {
        onAdd("An unexpected error occurred.", "error", "Error");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!isDialogOpen) {
      formik.resetForm();
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Add Category</CardTitle>
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
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(
                formik.errors.name,
                formik.touched.name
              )}
            />
            <InputErrorMessage
              error={formik.errors.name}
              touched={formik.touched.name}
            />
          </div>
          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Adding..." /> : "Save"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
