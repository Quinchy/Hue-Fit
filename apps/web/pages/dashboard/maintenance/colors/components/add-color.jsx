import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useFormik } from "formik";
import { addColorSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ImageColorPicker } from "react-image-color-picker";
import { LoadingMessage } from "@/components/ui/loading-message";

// Utility function to convert RGB to HEX
const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#000000";
  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export default function AddColorDialog({ buttonClassName = "", buttonName = "Add Color", onColorAdded }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", hexCode: "#000000" },
    validationSchema: addColorSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch("/api/maintenance/colors/add-color", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (response.ok) {
          const { color } = await response.json();
          onColorAdded && onColorAdded(color);
          resetForm();
          setShowAlert(true);
          setIsDialogOpen(false);
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        } else {
          console.error("Failed to add color");
        }
      } catch (error) {
        console.error("An error occurred while adding the color:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleColorPick = (rgbColor) => {
    const hex = rgbToHex(rgbColor);
    formik.setFieldValue("hexCode", hex);
  };

  return (
    <>
      {showAlert && (
        <Alert className="fixed z-50 w-[25rem] right-10 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">Color Added</AlertTitle>
            <AlertDescription className="text-green-300">
              The color has been added successfully.
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
            <DialogTitle>Add Color</DialogTitle>
          </DialogHeader>
          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-row gap-6">
              {/* Left Side: Inputs */}
              <div className="flex flex-col gap-4 w-[45%]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="font-bold flex flex-row items-center">
                    Color Name <Asterisk className="w-4" />
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter the Color name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={InputErrorStyle(formik.errors.name, formik.touched.name)}
                  />
                  <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="hexCode" className="font-bold flex flex-row items-center">
                    Hex Code <Asterisk className="w-4" />
                  </Label>
                  <div className="flex flex-row w-full items-center gap-2">
                    <Input
                      id="hexCode"
                      type="color"
                      name="hexCode"
                      value={formik.values.hexCode}
                      onChange={formik.handleChange}
                      className="w-12 h-12 p-0"
                    />
                    <Input
                      name="hexCode"
                      placeholder="#000000"
                      value={formik.values.hexCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={InputErrorStyle(formik.errors.hexCode, formik.touched.hexCode)}
                    />
                  </div>
                  <InputErrorMessage error={formik.errors.hexCode} touched={formik.touched.hexCode} />
                </div>
              </div>

              {/* Right Side: Upload Image and Color Picker */}
              <div className="flex flex-col gap-4 w-[55%]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="image">Upload Image (Pick a color)</Label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="bg-accent p-5 rounded-md border-2"
                    onChange={handleImageUpload}
                  />
                </div>

                {uploadedImage && (
                  <div className="relative flex flex-col items-center">
                    <ImageColorPicker
                      onColorPick={(rgb) => handleColorPick(rgb)}
                      imgSrc={uploadedImage}
                      zoom={1}
                    />
                    <p className="mt-2 text-sm text-primary/50">Click on the image to pick a color</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingMessage message="Adding..." /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
