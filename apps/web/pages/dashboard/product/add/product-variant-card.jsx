// product-variant-card.jsx
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Asterisk } from 'lucide-react';
import { useFormikContext } from 'formik';
import { InputErrorMessage } from "@/components/ui/error-message";
import { InputErrorStyle } from "@/components/ui/error-message";

const ProductVariantPictures = dynamic(() => import('./product-variant-pictures'), { ssr: false });

function orderSizes(sizes) {
  const sizeMap = new Map();
  const nextIds = new Set();
  sizes.forEach(size => {
    sizeMap.set(size.id, size);
    if (size.nextId !== null) {
      nextIds.add(size.nextId);
    }
  });
  const startIds = sizes.map(size => size.id).filter(id => !nextIds.has(id));
  const orderedSizes = [];
  startIds.forEach(startId => {
    let currentSize = sizeMap.get(startId);
    const visited = new Set();
    while (currentSize && !visited.has(currentSize.id)) {
      orderedSizes.push(currentSize);
      visited.add(currentSize.id);
      currentSize = sizeMap.get(currentSize.nextId);
    }
  });
  return orderedSizes;
}

export default function ProductVariantCard({ variant, productType, onRemove, variantIndex, colors, sizes, selectedSizes }) {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext() || {};
  const orderedSizes = orderSizes(sizes);
  const abbreviationToSizeMap = new Map();
  orderedSizes.forEach(size => {
    abbreviationToSizeMap.set(size.abbreviation, size);
  });

  const imagesError = errors?.variants?.[variantIndex]?.images;
  const imagesTouched = touched?.variants?.[variantIndex]?.images;
  const selectedOrderedSizes = orderedSizes.filter(size => selectedSizes.includes(size.abbreviation));

  return (
    <div className="flex flex-col gap-3 mb-5">
      <Card className="flex-1 flex flex-col p-5 gap-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Product Variant - {variantIndex + 1}</CardTitle>
          <Button
            variant="ghost"
            type="button"
            className="text-red-500 p-5 hover:bg-red-500 min-w-[3rem] min-h-[3rem]"
            onClick={onRemove}
          >
            <Trash2 className="scale-110 stroke-[2px]" />
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <ProductVariantPictures variantIndex={variantIndex} />
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

        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label className="font-bold flex flex-row items-center" htmlFor={`variants.${variantIndex}.price`}>
              Price <Asterisk className="w-4"/>
            </Label>
            <Input
              id={`variants.${variantIndex}.price`}
              name={`variants.${variantIndex}.price`}
              placeholder="Enter a price for the product"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.variants[variantIndex].price || ""}
              className={InputErrorStyle(errors.variants?.[variantIndex]?.price, touched.variants?.[variantIndex]?.price)}
            />
            <InputErrorMessage
              error={errors.variants?.[variantIndex]?.price}
              touched={touched.variants?.[variantIndex]?.price}
              condition={
                touched.variants &&
                touched.variants[variantIndex] &&
                errors.variants &&
                errors.variants[variantIndex]?.price
              }
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label className="font-bold flex flex-row items-center" htmlFor={`variants.${variantIndex}.color`}>
              Color <Asterisk className="w-4"/>
            </Label>
            <Select
              value={values.variants[variantIndex].color || ""}
              onValueChange={(value) => {
                setFieldValue(`variants.${variantIndex}.color`, value);
              }}
            >
              <SelectTrigger
                className={`w-full ${InputErrorStyle(errors.variants?.[variantIndex]?.color, touched.variants?.[variantIndex]?.color)}`}
              >
                <SelectValue placeholder="Select a color of the product" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.id} value={color.name}>
                    <div className="flex flex-row items-center gap-2">
                      <p className="p-2 rounded" style={{ backgroundColor: color.hexcode }}></p>
                      {color.name.toUpperCase()}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputErrorMessage
              error={errors.variants?.[variantIndex]?.color}
              touched={touched.variants?.[variantIndex]?.color}
              condition={
                touched.variants &&
                touched.variants[variantIndex] &&
                errors.variants &&
                errors.variants[variantIndex]?.color
              }
            />
          </div>
        </div>

        <div className="flex flex-row gap-3">
          {selectedOrderedSizes.map((size) => {
            const sizeAbbreviation = size.abbreviation;
            const sizeObject = abbreviationToSizeMap.get(sizeAbbreviation);
            const qIndex = values.variants[variantIndex].quantities.findIndex(q => q.size === sizeAbbreviation);
            const qError = errors?.variants?.[variantIndex]?.quantities?.[qIndex]?.quantity;
            const qTouched = touched?.variants?.[variantIndex]?.quantities?.[qIndex]?.quantity;
            return (
              <div key={sizeAbbreviation}>
                <div className="flex-1 flex flex-col gap-1">
                  <Label
                    className="font-bold flex flex-row items-center"
                    htmlFor={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
                  >
                    {`Quantity for size - ${sizeObject?.name || sizeAbbreviation}`} <Asterisk className="w-4"/>
                  </Label>
                  <Input
                    id={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
                    name={`variants.${variantIndex}.quantities.${qIndex}.quantity`}
                    type="text"
                    placeholder="Enter a quantity"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.variants[variantIndex].quantities[qIndex].quantity}
                    className={InputErrorStyle(
                      qError,
                      qTouched
                    )}
                  />
                  <InputErrorMessage
                    error={qError}
                    touched={qTouched}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
