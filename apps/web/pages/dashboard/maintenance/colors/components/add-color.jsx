import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Asterisk } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ImageColorPicker } from 'react-image-color-picker';

// Utility function to convert RGB to HEX
const rgbToHex = (rgb) => {
  const result = rgb.match(/\d+/g); // Extract RGB values
  if (!result || result.length < 3) return "#000000"; // Fallback in case of an error
  const [r, g, b] = result.map(Number);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export default function AddColorDialog({ buttonClassName = "", buttonName = "Add Color" }) {
  const [hexCode, setHexCode] = useState("#000000");
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleColorChange = (color) => {
    setHexCode(color);
  };

  const handleColorPick = (rgbColor) => {
    const hex = rgbToHex(rgbColor); // Convert RGB to HEX
    console.log('Selected color (HEX):', hex); // Log the HEX code
    setHexCode(hex); // Update the hexCode with the selected color
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
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
        <div className="flex flex-row gap-6">
          {/* Left Side: Inputs */}
          <div className="flex flex-col gap-4 w-[45%]">
            {/* Color Name Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="font-bold flex flex-row items-center">
                Color Name <Asterisk className="w-4" />
              </Label>
              <Input id="name" placeholder="Enter the Color name" />
            </div>

            {/* Hexcode Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="hexcode" className="font-bold flex flex-row items-center">
                Hexcode <Asterisk className="w-4" />
              </Label>
              <div className="flex flex-row w-full items-center gap-2">
                <Input
                  id="hexcode"
                  type="color"
                  value={hexCode}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-12 p-0"
                />
                <Input
                  type="text"
                  value={hexCode}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Upload Image and Color Picker */}
          <div className="flex flex-col gap-4 w-[75%]">
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">{"Upload Image (Pick a color)"}</Label>
              <input id="image" type="file" accept="image/*" className="bg-accent p-5 rounded-md border-2" onChange={handleImageUpload} />
            </div>

            {uploadedImage && (
              <div className="relative flex flex-col items-center">
                <ImageColorPicker
                  onColorPick={handleColorPick}
                  imgSrc={uploadedImage} // Pass the uploaded image as the source
                  zoom={1}
                />
                <p className="mt-2 text-sm text-primary/50">Click on the image to pick a color</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => console.log("Color Added", { hexCode })}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
