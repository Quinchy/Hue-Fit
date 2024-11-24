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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import { useState, useEffect } from "react";
import { addMeasurementSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddMeasurementDialog({
  buttonClassName = "",
  buttonName = "Add Measurement",
  onMeasurementAdded,
}) {
  const [showAlert, setShowAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/maintenance/types/get-types");
        if (response.ok) {
          const data = await response.json();
          setTypes(data.types || []);
        } else {
          console.error("Failed to fetch types");
        }
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    };

    fetchTypes();
  }, []);

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const { measurement } = await response.json();
          onMeasurementAdded && onMeasurementAdded(measurement);
          resetForm();
          setShowAlert(true);
          setIsDialogOpen(false);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          console.error("Failed to add measurement");
        }
      } catch (error) {
        console.error("Error adding measurement:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <>
      {showAlert && (
        <Alert className="fixed z-50 w-[30rem] bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Measurement Added</AlertTitle>
            <AlertDescription className="text-green-300">
              The measurement has been added successfully.
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
                placeholder="Enter measurement name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
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
                <SelectTrigger
                  className={InputErrorStyle(formik.errors.assignTo, formik.touched.assignTo)}
                >
                  <SelectValue placeholder="Select a clothing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {types.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputErrorMessage error={formik.errors.assignTo} touched={formik.touched.assignTo} />
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
