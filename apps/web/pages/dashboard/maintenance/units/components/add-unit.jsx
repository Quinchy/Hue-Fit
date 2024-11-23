import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ErrorMessage } from "@/components/ui/error-message";

export default function AddUnitDialog({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", abbreviation: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Unit name is required"),
      abbreviation: Yup.string()
        .max(10, "Abbreviation must be 10 characters or less")
        .required("Abbreviation is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/units/add-unit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const { unit } = await response.json(); // Get the newly created unit
          resetForm();
          if (onSuccess) onSuccess(unit); // Pass the new unit data to the parent
          alert("Unit added successfully!");
        } else {
          const error = await response.json();
          alert(error.error || "Failed to add unit.");
        }
      } catch (error) {
        console.error("Error adding unit:", error);
        alert("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ Add More</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add More</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="name">Unit Name</label>
              <Input
                id="name"
                name="name"
                placeholder="Enter unit name"
                value={formik.values.name}
                onChange={formik.handleChange}
                disabled={loading}
              />
              <ErrorMessage error={formik.errors.name} />
            </div>
            <div>
              <label htmlFor="abbreviation">Abbreviation</label>
              <Input
                id="abbreviation"
                name="abbreviation"
                placeholder="Enter abbreviation"
                value={formik.values.abbreviation}
                onChange={formik.handleChange}
                disabled={loading}
              />
              <ErrorMessage error={formik.errors.abbreviation} />
            </div>
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
