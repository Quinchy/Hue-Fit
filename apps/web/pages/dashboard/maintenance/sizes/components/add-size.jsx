// pages/sizes/components/add-size.jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { addSizeSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { CardTitle } from "@/components/ui/card";

export default function AddSizeDialog({ buttonClassName = "", buttonName = "Add Size", onSizeAdded }) {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      abbreviation: "",
      nextId: "none",
    },
    validationSchema: addSizeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name.toUpperCase(),
          abbreviation: values.abbreviation.toUpperCase(),
          nextId: values.nextId !== "none" ? parseInt(values.nextId, 10) : null,
        };
        const response = await fetch("/api/maintenance/sizes/add-size", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const data = await response.json();
          onSizeAdded && onSizeAdded(data.message, "success");
          resetForm();
          setIsDialogOpen(false);
        } else {
          const errorData = await response.json();
          onSizeAdded && onSizeAdded(errorData.error || "Failed to add size.", "error");
        }
      } catch {
        onSizeAdded && onSizeAdded("An error occurred while adding the size.", "error");
      }
    },
  });

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/maintenance/sizes/get-sizes?page=1&search=");
      if (response.ok) {
        const data = await response.json();
        setSizes(data.sizes || []);
      }
    } catch (error) {
      // Handle errors silently or log to console
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchSizes();
    } else {
      setSizes([]);
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
          <CardTitle className="text-2xl">Add Size</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
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
            <InputErrorMessage error={formik.errors.abbreviation} touched={formik.touched.abbreviation} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nextId" className="font-bold flex items-center">
              Next to
            </Label>
            <Select
              value={formik.values.nextId}
              onValueChange={(value) => formik.setFieldValue("nextId", value)}
              disabled={loading}
            >
              <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.nextId, formik.touched.nextId)}`}>
                <SelectValue placeholder={loading ? "Loading sizes..." : "Select a size or leave empty"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">No next size</SelectItem>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id.toString()}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <InputErrorMessage error={formik.errors.nextId} touched={formik.touched.nextId} />
          </div>

          <DialogFooter className="mt-10">
            <Button type="submit" disabled={formik.isSubmitting} className="w-1/2">
              {formik.isSubmitting ? <LoadingMessage message="Adding..." /> : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-1/2">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
