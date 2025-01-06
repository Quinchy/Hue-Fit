import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { addColorSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { ImageColorPicker } from "react-image-color-picker";
import { CardTitle } from "@/components/ui/card";
import { LoadingMessage } from "@/components/ui/loading-message";

const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#000000";
  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export default function AddColorDialog({ buttonClassName = "", buttonName = "Add Color", onColorAdded }) {
  const [uploadedImage, setUploadedImage] = useState(null);
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
          onColorAdded("Color added successfully.", "success");
          resetForm();
          setUploadedImage(null);
          setIsDialogOpen(false);
        } else {
          const errorData = await response.json();
          onColorAdded(errorData.error || "Failed to add color.", "error");
        }
      } catch {
        onColorAdded("An unexpected error occurred.", "error");
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

  useEffect(() => {
    if (!isDialogOpen) {
      formik.resetForm();
      setUploadedImage(null);
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus /> {buttonName}
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader className="mb-5">
          <CardTitle className="text-2xl">Add Color</CardTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit}>
          <div className="flex flex-row gap-5">
            {/* Name and Hex Code Section */}
            <div className="flex flex-col gap-4 w-1/2">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-bold flex items-center">
                  Name <Asterisk className="w-4 h-4 " />
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

              {/* Hex Code Field */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="hexCode" className="font-bold flex items-center">
                  Hex Code <Asterisk className="w-4 h-4 " />
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hexCode"
                    type="color"
                    name="hexCode"
                    value={formik.values.hexCode}
                    onChange={formik.handleChange}
                    className="w-12 h-12 border-none bg-transparent p-0"
                  />
                  <Input
                    name="hexCode"
                    placeholder="#000000"
                    value={formik.values.hexCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-[15rem] ${InputErrorStyle(formik.errors.hexCode, formik.touched.hexCode)}`}
                  />
                </div>
                <InputErrorMessage error={formik.errors.hexCode} touched={formik.touched.hexCode} />
              </div>
            </div>

            {/* Image Color Picker Section */}
            <div className="flex flex-col gap-4 w-1/2">
              <Label className="font-bold">Image Color Picker</Label>
              <div className="flex flex-col items-center gap-2 border-dashed border-2 p-5 rounded-md">
                <label htmlFor="image" className="cursor-pointer text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="stroke-primary/50" />
                    <span className="text-primary/50 font-thin">Click here to upload an image</span>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              {uploadedImage && (
                <div className="flex flex-col items-center">
                  <ImageColorPicker
                    onColorPick={(rgb) => handleColorPick(rgb)}
                    imgSrc={uploadedImage}
                    zoom={1}
                  />
                  <p className="mt-2 text-sm text-primary/50 font-thin bg-muted w-full text-center py-2 rounded-sm">
                    Click on the image to pick a color
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-10">
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? <LoadingMessage message="Saving..." /> : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-1/2">
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
