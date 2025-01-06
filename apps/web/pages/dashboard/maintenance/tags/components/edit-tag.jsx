// edit-tag.js (EditTagDialog Component)
import { useFormik } from "formik";
import * as Yup from "yup"; // Import Yup for schema definition
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InputErrorStyle, InputErrorMessage } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

// Define a separate validation schema for editing (typeId is not required)
const editTagSchema = Yup.object().shape({
  name: Yup.string().required("Tag name is required"),
  // typeId is omitted from the validation schema to prevent it from being required during edit
});

export default function EditTagDialog({ isOpen, onOpenChange, tag, onTagUpdated, types = [] }) {
  const [loading, setLoading] = useState(false);

  // Initialize Formik with the editTagSchema
  const formik = useFormik({
    initialValues: {
      name: tag?.name || "",
      typeId: tag?.typeId ? String(tag.typeId) : "", // Ensure typeId is a string
    },
    enableReinitialize: true,
    validationSchema: editTagSchema, // Use the edit-specific validation schema
    onSubmit: async (values) => {
      console.log("Submitting form with values:", values); // Log form values on submit
      setLoading(true);
      try {
        const response = await fetch(`/api/maintenance/tags/update-tag`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: tag?.id, name: values.name, typeId: values.typeId }), // Include typeId if needed
        });

        console.log("API response status:", response.status); // Log response status

        if (response.ok) {
          const { updatedTag } = await response.json();
          console.log("Tag updated successfully:", updatedTag); // Log successful update
          onTagUpdated("Tag updated successfully.", "success");
          onOpenChange(false);
        } else {
          const errorData = await response.json();
          console.error("Error updating tag:", errorData.error); // Log error from API
          onTagUpdated(errorData.error || "Failed to update tag.", "error");
        }
      } catch (error) {
        console.error("Unexpected error:", error); // Log unexpected errors
        onTagUpdated("An unexpected error occurred.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  // Set Formik values when the dialog opens or the tag changes
  useEffect(() => {
    if (isOpen && tag) {
      formik.setValues({
        name: tag.name || "",
        typeId: tag.typeId ? String(tag.typeId) : "",
      });
      console.log("Formik values set to:", formik.values); // Log formik values after setting
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tag]);

  // Log validation errors for debugging
  useEffect(() => {
    if (formik.errors && Object.keys(formik.errors).length > 0) {
      console.log("Formik validation errors:", formik.errors);
    }
  }, [formik.errors]);

  // Log touched fields for debugging
  useEffect(() => {
    if (formik.touched && Object.keys(formik.touched).length > 0) {
      console.log("Formik touched fields:", formik.touched);
    }
  }, [formik.touched]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Edit Tag</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          {/* Tag Name Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex items-center">
              Tag Name <Asterisk className="w-4 h-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter tag name"
              value={formik.values.name}
              onChange={(e) => {
                console.log("Name changed to:", e.target.value); // Log name change
                formik.handleChange(e);
              }}
              onBlur={(e) => {
                console.log("Name field blurred"); // Log blur event
                formik.handleBlur(e);
              }}
              className={InputErrorStyle(formik.errors.name, formik.touched.name)}
            />
            <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
          </div>

          {/* Assign to Type Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="typeId" className="font-bold flex items-center">
              Assign to Type <Asterisk className="w-4 h-4" />
            </Label>
            {/* Disabled Select for Display */}
            <Select
              value={formik.values.typeId}
              onValueChange={(value) => {
                console.log("TypeId set to:", value); // Log the typeId being set
                formik.setFieldValue("typeId", value);
              }}
              disabled
            >
              <SelectTrigger
                className={InputErrorStyle(formik.errors.typeId, formik.touched.typeId)}
              >
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Hidden Input to Ensure Formik Captures typeId */}
            <Input
              type="hidden"
              name="typeId"
              value={formik.values.typeId}
              onChange={formik.handleChange}
            />
            <InputErrorMessage error={formik.errors.typeId} touched={formik.touched.typeId} />
          </div>

          <DialogFooter className="mt-10 flex gap-2">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Updating..." /> : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                console.log("Cancel button clicked"); // Log cancel action
                onOpenChange(false);
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
