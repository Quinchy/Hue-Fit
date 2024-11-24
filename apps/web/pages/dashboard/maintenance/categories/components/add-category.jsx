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
import { Plus, Asterisk, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { InputErrorStyle, InputErrorMessage } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { addCategorySchema } from "@/utils/validation-schema";

export default function AddCategoryDialog({ buttonClassName = "", buttonName = "Add Category", onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: addCategorySchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/maintenance/categories/add-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          onAdd();
          resetForm();
          setShowAlert(true);
          setIsOpen(false); 
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } 
        else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "Failed to add category.");
        }
      } 
      catch {
        setErrorMessage("An error occurred.");
      } 
      finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            formik.resetForm();
            setErrorMessage("");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className={buttonClassName}>
            <Plus /> {buttonName}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex flex-row items-center">
                Category Name <Asterisk className="w-4" />
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {showAlert && (
        <Alert className="fixed z-50 w-[25rem] right-10 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Category Added</AlertTitle>
            <AlertDescription className="text-green-300">The category has been added successfully.</AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}
    </>
  );
}
