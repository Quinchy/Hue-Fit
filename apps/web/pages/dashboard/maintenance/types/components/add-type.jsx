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
import { useState } from "react";
import { useFormik } from "formik";
import { addTypeSchema } from "@/utils/validation-schema";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { CardTitle } from "@/components/ui/card";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddTypeDialog({
  buttonClassName = "",
  buttonName = "Add Type",
  onAdd,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: addTypeSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/types/add-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          onAdd("Type added successfully.", "success", "Success");
          resetForm();
          setOpen(false);
        } else {
          const errorData = await response.json();
          onAdd(errorData.error || "Failed to add type.", "error", "Error");
        }
      } catch (error) {
        onAdd("An unexpected error occurred.", "error", "Error");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Add Type</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex items-center">
                Name <Asterisk className="w-4 h-4" />
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter the type name"
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
          </div>
          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Saving..." /> : "Save"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                formik.resetForm();
                setOpen(false);
              }}
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
