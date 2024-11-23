import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";

export default function AddMeasurementDialog({ buttonClassName = "", buttonName = "Add Measurement", onSuccess }) {
  const [loading, setLoading] = useState(false);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      assignTo: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Measurement name is required"),
      assignTo: Yup.string().required("You must assign to a clothing type"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/measurements/add-measurement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        if (response.ok) {
          alert("Measurement added successfully!");
          onSuccess(); // Trigger a refresh of the table
          resetForm();
        } else {
          const data = await response.json();
          alert(data.error || "Failed to add measurement.");
        }
      } catch (error) {
        console.error("Error adding measurement:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">
              Measurement Name <Asterisk className="w-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter a measurement name"
              onChange={formik.handleChange}
              value={formik.values.name}
              disabled={loading}
            />
            <ErrorMessage error={formik.errors.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="assignTo" className="font-bold flex flex-row items-center">
              Assign to <Asterisk className="w-4" />
            </Label>
            <Select
              id="assignTo"
              onValueChange={(value) => formik.setFieldValue("assignTo", value)}
              value={formik.values.assignTo}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a clothing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="UPPERWEAR">UPPERWEAR</SelectItem>
                  <SelectItem value="LOWERWEAR">LOWERWEAR</SelectItem>
                  <SelectItem value="FOOTWEAR">FOOTWEAR</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <ErrorMessage error={formik.errors.assignTo} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
