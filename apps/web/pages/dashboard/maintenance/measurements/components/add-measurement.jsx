import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useFormik } from "formik";
import { CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { addMeasurementSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddMeasurementDialog({
  buttonClassName = "",
  buttonName = "Add Measurement",
  onMeasurementAdded,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/maintenance/types/get-types");
      if (response.ok) {
        const data = await response.json();
        setTypes(data.types || []);
      } else {
        console.error("Failed to fetch types.");
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchTypes();
    } else {
      setTypes([]);
    }
  }, [isDialogOpen]);

  const formik = useFormik({
    initialValues: {
      name: "",
      assignTo: "",
    },
    validationSchema: addMeasurementSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/measurements/add-measurement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          const { measurement } = await response.json();
          onMeasurementAdded && onMeasurementAdded("Measurement added successfully.", "success");
          resetForm();
          setIsDialogOpen(false);
        } else {
          const errorData = await response.json();
          onMeasurementAdded && onMeasurementAdded(errorData.error || "Failed to add measurement.", "error");
        }
      } catch (error) {
        console.error("Error adding measurement:", error);
        onMeasurementAdded && onMeasurementAdded("An unexpected error occurred.", "error");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader>
          <CardTitle className="text-2xl">Add Measurement</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">
              Measurement Name <Asterisk className="w-4" />
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
          <div className="flex flex-col gap-1">
            <Label htmlFor="assignTo" className="font-bold flex flex-row items-center">
              Assign to <Asterisk className="w-4" />
            </Label>
            <Select
              id="assignTo"
              onValueChange={(value) => formik.setFieldValue("assignTo", value)}
              value={formik.values.assignTo}
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
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-1/2">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
