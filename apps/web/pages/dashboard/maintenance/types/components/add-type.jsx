import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { ErrorMessage } from "@/components/ui/error-message";

export default function AddTypeDialog({
  buttonClassName = "",
  buttonName = "Add Type",
  onAdd,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Type Name is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/maintenance/types/add-type", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          onAdd(); // Refresh the parent table
          setIsOpen(false); // Close the dialog
        } else {
          const data = await response.json();
          setErrorMessage(data.error || "An error occurred.");
        }
      } catch (error) {
        setErrorMessage("An error occurred.");
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
          <DialogTitle>Add Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="font-bold flex flex-row items-center">
              Type Name <Asterisk className="w-4" />
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter a type name"
              value={formik.values.name}
              onChange={formik.handleChange}
              disabled={loading}
            />
            <ErrorMessage>{formik.errors.name}</ErrorMessage>
          </div>
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                formik.resetForm();
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
