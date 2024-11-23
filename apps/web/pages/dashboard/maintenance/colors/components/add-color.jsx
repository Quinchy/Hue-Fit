import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { colorSchema } from "@/utils/validation-schema";
import { ImageColorPicker } from "react-image-color-picker";

// Utility function to convert RGB to HEX
const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return "#000000";
  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export default function AddColorDialog({ buttonClassName = "", buttonName = "Add Color", onColorAdded }) {
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleColorPick = (rgbColor, setFieldValue) => {
    const hex = rgbToHex(rgbColor);
    setFieldValue("hexCode", hex);
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await fetch("/api/maintenance/colors/add-color", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const result = await response.json();
        if (onColorAdded) onColorAdded(result.color); // Notify parent component
        alert("Color added successfully!");
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add color");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={buttonClassName}><Plus /> {buttonName}</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[40rem]">
        <DialogHeader>
          <DialogTitle>Add Color</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{ name: "", hexCode: "#000000" }}
          validationSchema={colorSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue }) => (
            <Form>
              <div className="flex flex-row gap-6">
                {/* Left Side: Inputs */}
                <div className="flex flex-col gap-4 w-[45%]">
                  {/* Color Name Input */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name" className="font-bold flex flex-row items-center">
                      Color Name <Asterisk className="w-4" />
                    </Label>
                    <Field as={Input} id="name" name="name" placeholder="Enter the Color name" />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                  </div>

                  {/* Hexcode Input */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hexCode" className="font-bold flex flex-row items-center">
                      Hexcode <Asterisk className="w-4" />
                    </Label>
                    <div className="flex flex-row w-full items-center gap-2">
                      <Field
                        as={Input}
                        id="hexCode"
                        type="color"
                        name="hexCode"
                        className="w-12 h-12 p-0"
                      />
                      <Field
                        as={Input}
                        name="hexCode"
                        className="w-full"
                        placeholder="#000000"
                      />
                    </div>
                    <ErrorMessage name="hexCode" component="div" className="text-red-500 text-sm" />
                  </div>
                </div>

                {/* Right Side: Upload Image and Color Picker */}
                <div className="flex flex-col gap-4 w-[75%]">
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
                        onColorPick={(rgb) => handleColorPick(rgb, setFieldValue)}
                        imgSrc={uploadedImage}
                        zoom={1}
                      />
                      <p className="mt-2 text-sm text-primary/50">Click on the image to pick a color</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add</Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
