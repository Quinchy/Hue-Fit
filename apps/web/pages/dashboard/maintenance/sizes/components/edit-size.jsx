// pages/dashboard/sizes/edit-size.js

import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { addSizeSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { CardTitle } from "@/components/ui/card";

export default function EditSizeDialog({ isOpen, onOpenChange, size, onSizeUpdated }) {
  const [sizes, setSizes] = useState([]);
  const [loadingSizes, setLoadingSizes] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchSizes = async () => {
        try {
          const response = await fetch(`/api/maintenance/sizes/get-sizes?page=1&search=`);
          if (response.ok) {
            const data = await response.json();
            setSizes(data.sizes || []);
          } else {
            setErrorMessage("Failed to fetch sizes.");
          }
        } catch (error) {
          setErrorMessage("An error occurred while fetching sizes.");
        } finally {
          setLoadingSizes(false);
        }
      };

      fetchSizes();
    }
  }, [isOpen]);

  const nextToSize = sizes.find((s) => s.id === size.nextId)?.name || "No next size";

  const formik = useFormik({
    initialValues: {
      name: size?.name || "",
      abbreviation: size?.abbreviation || "",
    },
    enableReinitialize: true,
    validationSchema: addSizeSchema,
    onSubmit: async (values) => {
      try {
        const upperName = values.name.toUpperCase();
        const payload = { id: size.id, name: upperName, abbreviation: values.abbreviation };
        const response = await fetch(`/api/maintenance/sizes/update-size`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const { message, type } = await response.json();
          onOpenChange(false);
          onSizeUpdated && onSizeUpdated(message, type);
        } else {
          const errorData = await response.json();
          onSizeUpdated && onSizeUpdated(errorData.error || "Failed to update size.", "error");
        }
      } catch (error) {
        onSizeUpdated && onSizeUpdated("An error occurred while updating the size.", "error");
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Edit Size</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          {/* Size Name Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex items-center">
              Size Name <Asterisk className="w-4 h-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter a Size name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.name, formik.touched.name)}
            />
            <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
          </div>

          {/* Abbreviation Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="abbreviation" className="font-bold flex items-center">
              Abbreviation <Asterisk className="w-4 h-4" />
            </Label>
            <Input
              id="abbreviation"
              name="abbreviation"
              placeholder="Enter an abbreviation"
              value={formik.values.abbreviation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.abbreviation, formik.touched.abbreviation)}
            />
            <InputErrorMessage
              error={formik.errors.abbreviation}
              touched={formik.touched.abbreviation}
            />
          </div>

          {/* Next To Field */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="nextTo" className="font-bold flex items-center">
              Next to
            </Label>
            <Select disabled value={nextToSize !== "No next size" ? nextToSize : "no-next-size"}>
              <SelectTrigger
                className={`w-full ${InputErrorStyle(
                  "", // No error since it's disabled
                  false
                )}`}
              >
                <SelectValue
                  placeholder={nextToSize !== "No next size" ? nextToSize : "No next size"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {nextToSize !== "No next size" ? (
                    <SelectItem value={nextToSize}>
                      {nextToSize}
                    </SelectItem>
                  ) : (
                    <SelectItem value="no-next-size">
                      No next size
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputErrorMessage error="" touched={false} />
          </div>

          <DialogFooter className="mt-10">
            <Button type="submit" disabled={formik.isSubmitting} className="w-1/2">
              {formik.isSubmitting ? <LoadingMessage message="Updating..." /> : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
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
