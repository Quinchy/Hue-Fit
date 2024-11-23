// components/AddSizeDialog.jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { addSizeSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export default function AddSizeDialog({ buttonClassName = "", buttonName = "Add Size", onSizeAdded }) {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await fetch("/api/maintenance/sizes/get-sizes");
        if (response.ok) {
          const data = await response.json();
          setSizes(data.sizes || []);
        } else {
          console.error("Failed to fetch sizes");
        }
      } catch (error) {
        console.error("An error occurred while fetching sizes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSizes();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      abbreviation: "",
      nextTo: null,
    },
    validationSchema: addSizeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const selectedSize = sizes.find((size) => size.name === values.nextTo);
        const payload = { ...values, nextTo: selectedSize ? selectedSize.id : null };
        const response = await fetch("/api/maintenance/sizes/add-size", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setShowAlert(true);
          resetForm();
          setIsDialogOpen(false);
          onSizeAdded && onSizeAdded();
        } else {
          console.error("Failed to add size");
        }
      } catch (error) {
        console.error("An error occurred while adding the size:", error);
      }
    },
  });

  return (
    <>
      {showAlert && (
        <Alert className="fixed z-50 w-[25rem] bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Size Added</AlertTitle>
            <AlertDescription className="text-green-300">The size has been added successfully.</AlertDescription>
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
            <DialogTitle>Add Size</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* Size Name Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-bold flex flex-row items-center">
                  Size Name <Asterisk className="w-4" />
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

              {/* Abbreviation Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="abbreviation" className="font-bold flex flex-row items-center">
                  Abbreviation <Asterisk className="w-4" />
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
                <InputErrorMessage
                  error={formik.errors.abbreviation}
                  touched={formik.touched.abbreviation}
                />
              </div>

              {/* Next To Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="nextTo" className="font-bold flex flex-row items-center">
                  Next to
                </Label>
                <Select
                  disabled={loading}
                  onValueChange={(value) => formik.setFieldValue("nextTo", value)}
                >
                  <SelectTrigger
                    className={`w-full ${InputErrorStyle(
                      formik.errors.nextTo,
                      formik.touched.nextTo
                    )}`}
                  >
                    <SelectValue
                      placeholder={loading ? "Loading sizes..." : "Select a size or leave empty for largest"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sizes.map((size) => (
                        <SelectItem key={size.name} value={size.name}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <InputErrorMessage error={formik.errors.nextTo} touched={formik.touched.nextTo} />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
