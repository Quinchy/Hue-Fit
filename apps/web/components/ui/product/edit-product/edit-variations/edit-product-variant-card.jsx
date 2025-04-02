import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import {
  Asterisk,
  RefreshCcw,
  Archive,
  CheckCircle2,
  X,
  Loader,
} from "lucide-react";
import { useFormikContext } from "formik";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import Image from "next/image";
import { useEditProduct } from "@/providers/edit-product-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const EditProductVariantPictures = dynamic(
  () => import("./edit-product-variant-pictures"),
  { ssr: false }
);

export default function EditProductVariantCard({
  variant,
  productType,
  onRemove,
  variantIndex,
  displayNumber,
  selectedSizes,
  submitted,
}) {
  const {
    values = {},
    errors = {},
    touched = {},
    handleChange = () => {},
    handleBlur = () => {},
    setFieldValue = () => {},
  } = useFormikContext() || {};
  const { productDetails } = useEditProduct();
  const allSizes =
    productDetails?.ProductMeasurement?.map((pm) => pm.Size) || [];
  const uniqueSizes = [];
  const seen = new Set();
  allSizes.forEach((s) => {
    if (!seen.has(s.id)) {
      uniqueSizes.push(s);
      seen.add(s.id);
    }
  });
  const sizes = uniqueSizes;

  const orderedSizes = (() => {
    if (!Array.isArray(sizes)) return [];
    const sizeMap = new Map();
    const nextIds = new Set();
    sizes.forEach((size) => {
      sizeMap.set(size.id, size);
      if (size.nextId !== null) nextIds.add(size.nextId);
    });
    const startIds = sizes
      .map((size) => size.id)
      .filter((id) => !nextIds.has(id));
    const ordered = [];
    startIds.forEach((startId) => {
      let currentSize = sizeMap.get(startId);
      const visited = new Set();
      while (currentSize && !visited.has(currentSize.id)) {
        ordered.push(currentSize);
        visited.add(currentSize.id);
        currentSize = sizeMap.get(currentSize.nextId);
      }
    });
    return ordered;
  })();

  const imagesError = errors?.variants?.[variantIndex]?.images;
  const imagesTouched = touched?.variants?.[variantIndex]?.images;

  const isVirtualFittingRequired = [
    "UPPERWEAR",
    "LOWERWEAR",
    "OUTERWEAR",
  ].includes(productType);
  const disablePngClothe = !isVirtualFittingRequired;
  const isPngClotheMissing =
    !disablePngClothe && !values.variants?.[variantIndex]?.pngClothe;
  const showPngClotheError = submitted && isPngClotheMissing;

  const handlePngClotheChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFieldValue(`variants.${variantIndex}.pngClothe`, {
        file,
        url: imageURL,
      });
    }
  };

  // Retrieve the full color object from provider
  const colorObj = productDetails?.ProductVariant?.[variantIndex]?.Color;

  let computedImagesError = "";
  if (Array.isArray(imagesError)) {
    computedImagesError = imagesError
      .map((err) => (typeof err === "string" ? err : JSON.stringify(err)))
      .join(", ");
  } else if (typeof imagesError === "string") {
    computedImagesError = imagesError;
  }

  // State for archive confirmation dialog and archival API call
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveAlertVisible, setArchiveAlertVisible] = useState(false);
  const [archiveAlertMessage, setArchiveAlertMessage] = useState("");

  const handleArchiveConfirm = async () => {
    setArchiveLoading(true);
    try {
      // Call the API to toggle archival status.
      const response = await fetch("/api/products/manage-archival-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: productDetails.ProductVariant[variantIndex]?.id,
          archive: !variant.isArchived,
        }),
      });
      if (response.ok) {
        // Update the Formik state for the variant's isArchived flag.
        const newStatus = !variant.isArchived;
        const updatedVariants = [...values.variants];
        updatedVariants[variantIndex] = {
          ...updatedVariants[variantIndex],
          isArchived: newStatus,
        };
        setFieldValue("variants", updatedVariants);
        setArchiveAlertMessage(
          newStatus ? "Product Variant Archived" : "Product Variant Unarchived"
        );
        setArchiveAlertVisible(true);
      } else {
        console.error("Server error while managing archival status");
      }
    } catch (error) {
      console.error("Error managing archival status", error);
    } finally {
      setArchiveLoading(false);
      setShowArchiveDialog(false);
      setTimeout(() => setArchiveAlertVisible(false), 3000);
    }
  };

  return (
    <Card className="flex-1 flex flex-col p-5 gap-5">
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl">
          Product Variant - {displayNumber || variantIndex + 1}
        </CardTitle>
        <Button
          variant="destructive"
          type="button"
          className={`p-5 min-w-[3rem] min-h-[3rem] transition-all duration-500 ease-in-out active:scale-90 ${
            variant.isArchived
              ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/25"
              : "bg-red-500/10 text-red-500 hover:bg-red-500/25"
          }`}
          onClick={() => setShowArchiveDialog(true)}
        >
          <Archive className="scale-125" />
          {variant.isArchived ? "Unarchive" : "Archive"}
        </Button>
      </div>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2">
          <Label className="font-bold flex flex-row items-center">
            PNG Clothing for Virtual Fitting
            <Asterisk className="w-4" />
          </Label>
          <div
            className={`relative border-2 border-dashed p-4 rounded-lg min-w-[320px] min-h-[320px] max-w-[320px] max-h-[320px] ${
              disablePngClothe ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => {
              if (!disablePngClothe) {
                document.getElementById(`pngClothe-${variantIndex}`).click();
              }
            }}
          >
            {disablePngClothe ? (
              <div className="text-center text-primary/50 font-extralight mt-32">
                Virtual Fitting is not available in this type
              </div>
            ) : values.variants?.[variantIndex]?.pngClothe ? (
              <>
                <Image
                  src={values.variants?.[variantIndex]?.pngClothe.url}
                  alt="PNG Clothing Preview"
                  width={280}
                  height={280}
                  className="object-contain min-w-[280px] min-h-[280px] max-w-[280px] max-h-[280px]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 opacity-0 hover:opacity-80 transition-opacity mix-blend-difference">
                  <span className="text-white font-light uppercase tracking-wider flex gap-2 items-center">
                    <RefreshCcw /> Replace
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-primary/50 font-extralight mt-32">
                Click here to upload PNG clothing
              </div>
            )}
          </div>
          <input
            id={`pngClothe-${variantIndex}`}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={handlePngClotheChange}
            disabled={disablePngClothe}
          />
        </div>
        <div className="flex flex-col gap-1">
          <EditProductVariantPictures variantIndex={variantIndex} />
          <InputErrorMessage
            error={errors?.variants?.[variantIndex]?.images}
            touched={touched?.variants?.[variantIndex]?.images}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <Label
            className="font-bold flex flex-row items-center"
            htmlFor={`variants.${variantIndex}.price`}
          >
            Price <Asterisk className="w-4" />
          </Label>
          <Input
            id={`variants.${variantIndex}.price`}
            name={`variants.${variantIndex}.price`}
            placeholder="Enter a price for the product"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.variants?.[variantIndex]?.price || ""}
            className={InputErrorStyle(
              errors?.variants?.[variantIndex]?.price,
              touched?.variants?.[variantIndex]?.price
            )}
          />
          <InputErrorMessage
            error={errors?.variants?.[variantIndex]?.price}
            touched={touched?.variants?.[variantIndex]?.price}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <Label
            className="font-bold flex flex-row items-center"
            htmlFor={`variants.${variantIndex}.color`}
          >
            Color <Asterisk className="w-4" />
          </Label>
          <div className="flex items-center gap-2 cursor-not-allowed bg-accent border-border text-sm border-2 px-5 py-2 rounded-md opacity-50">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: colorObj?.hexcode || "#ffffff" }}
            ></div>
            <span className="text-muted-foreground select-none">
              {colorObj?.name || "No Color"}
            </span>
          </div>
          <InputErrorMessage
            error={errors?.variants?.[variantIndex]?.color}
            touched={touched?.variants?.[variantIndex]?.color}
          />
        </div>
      </div>

      {/* Archive confirmation dialog */}
      {showArchiveDialog && (
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {variant.isArchived ? "Unarchive Variant" : "Archive Variant"}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to{" "}
                {variant.isArchived ? "unarchive" : "archive"} this variant?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="w-20"
                onClick={handleArchiveConfirm}
                disabled={archiveLoading}
              >
                {archiveLoading ? (
                  <Loader className="animate-spin w-5 h-5" />
                ) : (
                  "Yes"
                )}
              </Button>
              <Button
                className="w-20"
                variant="outline"
                onClick={() => setShowArchiveDialog(false)}
                disabled={archiveLoading}
              >
                No
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Alert for successful archival change */}
      {archiveAlertVisible && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              {archiveAlertMessage}
            </AlertTitle>
            <AlertDescription className="text-green-300">
              {archiveAlertMessage.includes("Archived")
                ? "The variant has been archived successfully."
                : "The variant has been unarchived successfully."}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setArchiveAlertVisible(false)}
          >
            <X className="-translate-x-[0.85rem]" />
          </Button>
        </Alert>
      )}
    </Card>
  );
}
