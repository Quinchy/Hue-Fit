import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ErrorMessage } from "@/components/ui/error-message";
import { Alert } from "@/components/ui/alert";

export default function AddCategoryDialog({ buttonClassName = "", buttonName = "Add Category", onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Category name is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      try {
        const response = await fetch("/api/maintenance/categories/add-categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const data = await response.json();
          setSuccessMessage("Category added successfully!");
          setIsOpen(false);
          formik.resetForm();
          if (onAdd) {
            onAdd(); // Trigger refresh in the parent component
          }
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "Failed to add category");
        }
      } catch (error) {
        setErrorMessage("An error occurred while adding the category");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">
              Category Name <Asterisk className="w-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter a category name"
              value={formik.values.name}
              onChange={formik.handleChange}
              disabled={loading}
            />
            <ErrorMessage>{formik.errors.name}</ErrorMessage>
          </div>
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                formik.resetForm();
                setErrorMessage("");
                setSuccessMessage("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
