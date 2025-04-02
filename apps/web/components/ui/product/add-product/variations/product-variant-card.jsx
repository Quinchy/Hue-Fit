import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Trash2, Asterisk, ChevronsUpDown, TriangleAlert } from "lucide-react";
import { useFormikContext } from "formik";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import Image from "next/image";
import { useState } from "react";

// Import shadcn popover and command components
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

const EditProductVariantPictures = dynamic(
  () => import("./product-variant-pictures"),
  { ssr: false }
);

// ColorCombobox built using a Popover + Command combination
function ColorCombobox({
  colors,
  selectedColor,
  onSelectColor,
  errors,
  touched,
  variantIndex,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const colorObj = colors.find((c) => c.name === selectedColor);
  const selectedHex = colorObj?.hexcode || "";
  const filteredColors =
    query === ""
      ? colors
      : colors.filter((color) =>
          color.name.toLowerCase().includes(query.toLowerCase())
        );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`w-full font-normal text-left flex justify-between active:scale-100 ${InputErrorStyle(
            errors?.variants?.[variantIndex]?.color,
            touched?.variants?.[variantIndex]?.color
          )}`}
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-2">
            {selectedColor ? (
              <>
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedHex }}
                ></span>
                <span className="text-primary normal-case">
                  {selectedColor}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground normal-case">
                Select a color
              </span>
            )}
          </div>
          <ChevronsUpDown className="w-6 h-6 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="[&_[cmdk-input]]:h-12 w-[48.9rem]">
          <CommandInput
            placeholder="Search color..."
            onValueChange={(val) => setQuery(val)}
          />
          <CommandList>
            {filteredColors.map((color) => (
              <CommandItem
                key={color.id}
                onSelect={() => {
                  onSelectColor(color.name);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: color.hexcode }}
                  />
                  {color.name.toUpperCase()}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function EditProductVariantCard({
  variant,
  productType,
  onRemove,
  variantIndex,
  colors,
  sizes,
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
    submitCount,
  } = useFormikContext() || {};

  // Order sizes as needed
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
  const variantQuantities = values.variants?.[variantIndex]?.quantities || [];
  const selectedOrderedSizes = orderedSizes.filter((s) =>
    selectedSizes?.includes(s.abbreviation)
  );

  // Determine if virtual fitting is required based on product type
  const isVirtualFittingRequired = [
    "UPPERWEAR",
    "LOWERWEAR",
    "OUTERWEAR",
  ].includes(productType);
  const disablePngClothe = !isVirtualFittingRequired;

  // For UI error display:
  const isPngClotheMissing =
    !disablePngClothe && !values.variants?.[variantIndex]?.pngClothe;
  // Only show the error after user submits at least once
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

  // Handler for color selection from the combobox
  const handleSelectColor = (colorName) => {
    setFieldValue(`variants.${variantIndex}.color`, colorName);
  };

  return (
    <Card className="flex-1 flex flex-col p-5 gap-5">
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl">
          Product Variant - {variantIndex + 1}
        </CardTitle>
        {variantIndex > 0 && (
          <Button
            variant="destructive"
            type="button"
            className="bg-red-500/10 text-red-500 p-5 hover:bg-red-500/25 min-w-[3rem] min-h-[3rem] transition-all duration-500 ease-in-out active:scale-90"
            onClick={onRemove}
          >
            <Trash2 className="scale-110 stroke-[2px]" />
          </Button>
        )}
      </div>
      <div className="flex flex-row gap-3">
        <div className="flex flex-col gap-2">
          <Label className="font-bold flex flex-row items-center">
            PNG Clothing for Virtual Fitting
            <Asterisk className="w-4" />
          </Label>
          <div
            className={`border-2 border-dashed p-4 rounded-lg min-w-[320px] min-h-[320px] max-w-[320px] max-h-[320px] ${
              showPngClotheError ? "border-red-600" : "border-border"
            } ${
              disablePngClothe || values.variants?.[variantIndex]?.pngClothe
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
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
              <Image
                src={values.variants?.[variantIndex]?.pngClothe.url}
                alt="PNG Clothing Preview"
                width={280}
                height={280}
                className="object-contain min-w-[280px] min-h-[280px] max-w-[280px] max-h-[280px]"
              />
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
          {/* Show error if exists */}
          {showPngClotheError && (
            <p className="text-red-500 text-sm flex flex-row items-center gap-2">
              <TriangleAlert width={20} />
              PNG clothe is required.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <EditProductVariantPictures variantIndex={variantIndex} />
          <InputErrorMessage
            error={imagesError}
            touched={imagesTouched}
            condition={
              touched.variants &&
              touched.variants[variantIndex] &&
              errors.variants &&
              errors.variants[variantIndex]?.images
            }
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
            condition={
              touched.variants &&
              touched.variants[variantIndex] &&
              errors.variants &&
              errors.variants[variantIndex]?.price
            }
          />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <Label
            className="font-bold flex flex-row items-center"
            htmlFor={`variants.${variantIndex}.color`}
          >
            Color <Asterisk className="w-4" />
          </Label>
          <ColorCombobox
            colors={colors}
            selectedColor={values.variants?.[variantIndex]?.color || ""}
            onSelectColor={handleSelectColor}
            errors={errors}
            touched={touched}
            variantIndex={variantIndex}
          />
          <InputErrorMessage
            error={errors?.variants?.[variantIndex]?.color}
            touched={touched?.variants?.[variantIndex]?.color}
            condition={
              touched.variants &&
              touched.variants[variantIndex] &&
              errors.variants &&
              errors.variants[variantIndex]?.color
            }
          />
        </div>
      </div>

      <div className="flex flex-row flex-wrap gap-3">
        {selectedOrderedSizes.map((sz) => {
          const sizeAbbreviation = sz.abbreviation;
          const qIndex = variantQuantities.findIndex(
            (q) => q.size === sizeAbbreviation
          );
          if (qIndex === -1) return null;
          const qError =
            errors?.variants?.[variantIndex]?.quantities?.[qIndex]?.quantity;
          const qTouched =
            touched?.variants?.[variantIndex]?.quantities?.[qIndex]?.quantity;
          return (
            <div key={sizeAbbreviation} className="flex-1 flex flex-col gap-1">
              <Label
                className="font-bold flex flex-row items-center"
                htmlFor={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
              >
                {`Quantity for size ${sz.name || sizeAbbreviation}`}
                <Asterisk className="w-4" />
              </Label>
              <Input
                id={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
                name={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
                type="text"
                placeholder="Enter a quantity"
                onChange={handleChange}
                onBlur={handleBlur}
                value={
                  values.variants?.[variantIndex]?.quantities?.[qIndex]
                    ?.quantity || ""
                }
                className={InputErrorStyle(qError, qTouched)}
              />
              <InputErrorMessage error={qError} touched={qTouched} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
