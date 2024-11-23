import { useState, useEffect } from "react";
import { useFormik } from "formik";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { InputErrorStyle, InputErrorMessage } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { addTagSchema } from "@/utils/validation-schema";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function AddTagDialog({ buttonClassName = "", buttonName = "Add Tag", onTagAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch("/api/maintenance/types/get-types");
        if (response.ok) {
          const data = await response.json();
          setTypes(data.types || []);
        } else {
          setTypes([]);
        }
      } catch (error) {
        setTypes([]);
      }
    };
    fetchTypes();
  }, []);

  const formik = useFormik({
    initialValues: { name: "", typeName: "" },
    validationSchema: addTagSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const response = await fetch("/api/maintenance/tags/add-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const { tag } = await response.json();
          onTagAdded(tag);
          resetForm();
          setShowAlert(true);
          setIsOpen(false);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.error || "An error occurred.");
        }
      } catch {
        setErrorMessage("An error occurred.");
      } finally {
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
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex flex-row items-center">
                Tag Name <Asterisk className="w-4" />
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter tag name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="typeName" className="font-bold flex flex-row items-center">
                Assign to Type <Asterisk className="w-4" />
              </Label>
              <Select
                value={formik.values.typeName}
                onValueChange={(value) => formik.setFieldValue("typeName", value)}
              >
                <SelectTrigger className={InputErrorStyle(formik.errors.typeName, formik.touched.typeName)}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputErrorMessage error={formik.errors.typeName} touched={formik.touched.typeName} />
            </div>
            {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingMessage message="Adding..." /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {showAlert && (
        <Alert className="fixed z-50 w-[25rem] bottom-10 flex items-center shadow-lg rounded-lg">
        <CheckCircle2 className="h-10 w-10 stroke-green-500" />
        <div className="ml-7">
          <AlertTitle className="text-green-400 text-base font-semibold">Tag Added</AlertTitle>
          <AlertDescription className="text-green-300">The tag has been added successfully.</AlertDescription>
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
