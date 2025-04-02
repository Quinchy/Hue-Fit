import { useState } from "react";
import { useFormikContext } from "formik";
import Image from "next/image";
import { Plus, Trash2, Asterisk, Loader, CheckCircle2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { InputErrorStyle } from "@/components/ui/error-message";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function EditProductVariantPictures({ variantIndex }) {
  const { values, errors, touched, setFieldValue } = useFormikContext() || {};
  const images = values?.variants?.[variantIndex]?.images || [];
  const fieldError = errors?.variants?.[variantIndex]?.images;
  const fieldTouched = touched?.variants?.[variantIndex]?.images;

  // Dialog and deletion state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Handle adding a new image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const uniqueId = `${file.name}-${Date.now()}`;
      const newImage = { id: uniqueId, file, url: imageUrl };
      setFieldValue(`variants.${variantIndex}.images`, [...images, newImage]);
    }
  };

  // Open confirmation dialog instead of immediate removal
  const openDeleteDialog = (index) => {
    setSelectedImageIndex(index);
    setDeleteDialogOpen(true);
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (selectedImageIndex === null) return;
    setDeleteLoading(true);

    // Get the image object to delete and use its url as unique identifier.
    const imageToDelete = images[selectedImageIndex];

    try {
      const response = await fetch(
        "/api/products/delete-product-variant-picture",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: imageToDelete.url }),
        }
      );
      if (!response.ok) {
        console.error("Failed to delete product variant picture");
      }
    } catch (error) {
      console.error("Error deleting product variant picture", error);
    }

    // Remove image from Formik field regardless of API call.
    const updatedImages = images.filter((_, idx) => idx !== selectedImageIndex);
    setFieldValue(`variants.${variantIndex}.images`, updatedImages);
    setDeleteLoading(false);
    setDeleteDialogOpen(false);
    setAlertVisible(true);
    // Hide alert after 3 seconds
    setTimeout(() => setAlertVisible(false), 3000);
  };

  return (
    <>
      <div className="flex flex-col min-w-full max-w-[71rem] gap-2">
        <Label className="font-bold flex flex-row items-center">
          Product Variant Pictures <Asterisk className="w-4" />
        </Label>
        <div className="overflow-x-auto">
          <div className="flex gap-3 w-max">
            {images.map((image, idx) => (
              <div
                key={image.id || idx}
                className="relative bg-accent rounded border-2 border-border w-[320px] h-[320px] overflow-hidden mb-5"
              >
                <Image
                  src={image.url}
                  alt={`Product Image ${idx + 1}`}
                  width={320}
                  height={320}
                  className="object-contain w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => openDeleteDialog(idx)}
                  className="absolute top-2 right-2 bg-red-500/10 text-red-500 p-2 rounded shadow-accent shadow-sm hover:bg-red-500/25 active:scale-90 duration-500 ease-in-out transition-all"
                  aria-label="Remove Image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <label
              className={`flex flex-col items-center text-primary/25 justify-center w-[320px] h-[320px] border-2 rounded-lg border-dashed cursor-pointer ${InputErrorStyle(
                fieldError,
                fieldTouched
              )}`}
            >
              <Plus className="scale-110 stroke-[3px] mr-2" />
              <p className="text-xl font-semibold">Add Picture</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this photo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-20"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader className="animate-spin w-5 h-5" />
              ) : (
                "Yes"
              )}
            </Button>
            <Button
              className="w-20"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              No
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert for successful deletion */}
      {alertVisible && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Product Variant Picture Deleted
            </AlertTitle>
            <AlertDescription className="text-green-300">
              An image in the product variant has been deleted successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setAlertVisible(false)}
          >
            <X className="-translate-x-[0.85rem]" />
          </Button>
        </Alert>
      )}
    </>
  );
}
