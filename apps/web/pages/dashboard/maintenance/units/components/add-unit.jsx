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
import { useFormik } from "formik";
import { useState } from "react";
import { addUnitSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddUnitDialog({
  buttonClassName = "",
  buttonName = "Add Unit",
  onUnitAdded,
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", abbreviation: "" },
    validationSchema: addUnitSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/units/add-unit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const { unit } = await response.json();
          onUnitAdded && onUnitAdded(unit);
          resetForm();
          setShowAlert(true);
          setIsDialogOpen(false);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          console.error("Failed to add unit");
        }
      } catch (error) {
        console.error("Error adding unit:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      {showAlert && (
        <Alert className="fixed z-50 w-[25rem] bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Unit Added</AlertTitle>
            <AlertDescription className="text-green-300">
              The unit has been added successfully.
            </AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className={buttonClassName}>
            <Plus /> {buttonName}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-bold flex flex-row items-center">
                  Unit Name <Asterisk className="w-4" />
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter unit name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(formik.errors.name, formik.touched.name)}
                />
                <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="abbreviation" className="font-bold flex flex-row items-center">
                  Abbreviation <Asterisk className="w-4" />
                </Label>
                <Input
                  id="abbreviation"
                  name="abbreviation"
                  placeholder="Enter abbreviation"
                  value={formik.values.abbreviation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(
                    formik.errors.abbreviation,
                    formik.touched.abbreviation
                  )}
                />
                <InputErrorMessage
                  error={formik.errors.abbreviation}
                  touched={formik.touched.abbreviation}
                />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={formik.isSubmitting}>
                {loading ? <LoadingMessage message="Adding..." /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
