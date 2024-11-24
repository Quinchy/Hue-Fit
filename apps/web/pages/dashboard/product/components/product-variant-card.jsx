import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Asterisk } from 'lucide-react';
import { useFormikContext } from 'formik';
import { InputErrorMessage } from "@/components/ui/error-message";
import { InputErrorStyle } from "@/components/ui/error-message";

const ProductVariantPictures = dynamic(() => import('../components/product-variant-pictures'), { ssr: false });

const fetcher = (url) => fetch(url).then((res) => res.json());

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

export default function ProductVariantCard({ variant, productType, onRemove, variantIndex }) {
  const { data: productData, error } = useSWR('/api/products/get-product-related-info', fetcher);

  const { values, setFieldValue, setFieldTouched, getFieldProps, errors, touched } = useFormikContext() || {};

  if (!productData) return <div>Loading...</div>;

  const { colors, sizes } = productData;

  const orderedSizes = orderSizes(sizes);

  const abbreviationToSizeMap = new Map();
  orderedSizes.forEach(size => {
    abbreviationToSizeMap.set(size.abbreviation, size);
  });

  const imagesError = errors?.variants?.[variantIndex]?.images;
  const imagesTouched = touched?.variants?.[variantIndex]?.images;

  const selectedSizes = values.variants[variantIndex].sizes || [];
  const selectedOrderedSizes = orderedSizes.filter(size => selectedSizes.includes(size.abbreviation));

  return (
    <div className="flex flex-col gap-5 mb-5">
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
      <Card className="flex-1 p-5">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Product Variant Information</CardTitle>
          <Button variant="ghost" type="button" className="text-red-500 p-5 hover:bg-red-500 min-w-[3rem] min-h-[3rem]" onClick={onRemove}>
            <Trash2 className="scale-110 stroke-[2px]" />
          </Button>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <Label className="font-bold flex flex-row items-center" htmlFor={`variants.${variantIndex}.price`}>Price <Asterisk className="w-4"/></Label>
            <Input 
              id={`variants.${variantIndex}.price`}
              placeholder="Enter the price" 
              {...getFieldProps(`variants.${variantIndex}.price`)}
              className={InputErrorStyle(errors.variants?.[variantIndex]?.price, touched.variants?.[variantIndex]?.price)}
            />
            <InputErrorMessage
              error={errors.variants?.[variantIndex]?.price}
              touched={touched.variants?.[variantIndex]?.price}
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <Label className="font-bold flex flex-row items-center" htmlFor="color">Color <Asterisk className="w-4"/></Label>
            <Select
              value={values.variants[variantIndex].color}
              onValueChange={(value) => setFieldValue(`variants.${variantIndex}.color`, value)}
            >
              <SelectTrigger className={`w-full ${InputErrorStyle(errors.variants?.[variantIndex]?.color, touched.variants?.[variantIndex]?.color)}`}>
                <SelectValue placeholder="Select a color" />
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
            />
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-3">
          <Label className="font-bold flex flex-row items-center">Size <Asterisk className="w-4"/></Label>
          <ToggleGroup type="multiple" className="flex justify-start gap-2">
            {orderedSizes.map((size) => (
              <ToggleGroupItem
                key={size.id}
                value={size.abbreviation}
                variant="outline"
                selected={values.variants[variantIndex].sizes?.includes(size.abbreviation) || false}
                onClick={() => {
                  const isSelected = values.variants[variantIndex].sizes?.includes(size.abbreviation);

                  const updatedSizes = isSelected
                    ? values.variants[variantIndex].sizes.filter((s) => s !== size.abbreviation)
                    : [...(values.variants[variantIndex].sizes || []), size.abbreviation];
                  setFieldValue(`variants.${variantIndex}.sizes`, updatedSizes);
                  setFieldTouched(`variants.${variantIndex}.sizes`, true);

                  if (!values.variants[variantIndex].quantities) {
                    setFieldValue(`variants.${variantIndex}.quantities`, {});
                  }

                  if (isSelected) {
                    const updatedQuantities = { ...values.variants[variantIndex].quantities };
                    delete updatedQuantities[size.abbreviation];
                    setFieldValue(`variants.${variantIndex}.quantities`, updatedQuantities);

                    const updatedMeasurements = { ...values.measurementsBySize };
                    delete updatedMeasurements[size.abbreviation];
                    setFieldValue("measurementsBySize", updatedMeasurements);
                  } else {
                    setFieldValue(`variants.${variantIndex}.quantities.${size.abbreviation}`, ' ');
                  }
                }}
                className="min-w-14 min-h-14 border-2"
              >
                {size.abbreviation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <InputErrorMessage
            error={errors.variants?.[variantIndex]?.sizes}
            touched={touched.variants?.[variantIndex]?.sizes}
          />
        </div>

        {selectedOrderedSizes.map((size) => {
          const sizeAbbreviation = size.abbreviation;
          const sizeObject = abbreviationToSizeMap.get(sizeAbbreviation);
          return (
            <div key={sizeAbbreviation} className="border-t-2 border-t-border border-dashed py-4 mt-4">
              <h3 className="font-semibold text-lg mb-2">{`Quantity for Size - ${sizeObject?.name || sizeAbbreviation}`}</h3>

              <div className="flex-1 flex flex-col gap-3 mb-5">
                <Label className="font-bold flex flex-row items-center" htmlFor={`variants.${variantIndex}.quantities.${sizeAbbreviation}`}>Quantity <Asterisk className="w-4"/></Label>
                <Input 
                  id={`variants.${variantIndex}.quantities.${sizeAbbreviation}`}
                  type="number"
                  placeholder="Enter quantity"
                  value={values.variants[variantIndex].quantities?.[sizeAbbreviation] || ""}
                  onChange={(e) => {
                    setFieldValue(`variants.${variantIndex}.quantities.${sizeAbbreviation}`, e.target.value);
                    setFieldTouched(`variants.${variantIndex}.quantities.${sizeAbbreviation}`, true);
                  }}    
                  className={InputErrorStyle(errors.variants?.[variantIndex]?.quantities?.[sizeAbbreviation], touched.variants?.[variantIndex]?.quantities?.[sizeAbbreviation])}                
                />
                <InputErrorMessage
                  error={errors.variants?.[variantIndex]?.quantities?.[sizeAbbreviation]}
                  touched={touched.variants?.[variantIndex]?.quantities?.[sizeAbbreviation]}
                />
              </div>
            </div>
          );
        })}

      </Card>
    </div>
  );
}
