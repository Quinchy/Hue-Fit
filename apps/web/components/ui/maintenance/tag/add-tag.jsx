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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import {
  InputErrorStyle,
  InputErrorMessage,
} from "@/components/ui/error-message";
import { addTagSchema } from "@/utils/validation-schema";
import { LoadingMessage } from "@/components/ui/loading-message";
import { CardTitle } from "@/components/ui/card";

export default function AddTagDialog({
  buttonClassName = "",
  buttonName = "Add Tag",
  onTagAdded,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/maintenance/types/get-types");
      const data = await response.json();
      setTypes(data.types || []);
    } catch {
      setTypes([]);
    }
  };

  const formik = useFormik({
    initialValues: { name: "", typeName: "" },
    validationSchema: addTagSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/tags/add-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          onTagAdded("Tag added successfully.", "success", "Success");
          resetForm();
          setIsOpen(false);
        } else {
          const errorData = await response.json();
          onTagAdded(errorData.error || "Failed to add tag.", "error", "Error");
        }
      } catch {
        onTagAdded("An unexpected error occurred.", "error", "Error");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) fetchTypes();
      }}
    >
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Add Tag</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex items-center">
                Tag Name <Asterisk className="w-4 h-4" />
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter tag name"
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="typeName" className="font-bold flex items-center">
                Assign to Type <Asterisk className="w-4 h-4" />
              </Label>
              <Select
                value={formik.values.typeName}
                onValueChange={(value) =>
                  formik.setFieldValue("typeName", value)
                }
              >
                <SelectTrigger
                  className={InputErrorStyle(
                    formik.errors.typeName,
                    formik.touched.typeName
                  )}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputErrorMessage
                error={formik.errors.typeName}
                touched={formik.touched.typeName}
              />
            </div>
          </div>
          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Adding..." /> : "Save"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
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
