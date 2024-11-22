// components/product-variant-card.jsx
import { useState, useEffect } from 'react';
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

export default function ProductVariantCard({ variant, productType, onRemove, variantIndex }) {
  const [productData, setProductData] = useState(null);

  const { values, setFieldValue, setFieldTouched, getFieldProps, errors, touched } = useFormikContext() || {};

  useEffect(() => {
    const loadProductData = async () => {
      const cachedData = JSON.parse(localStorage.getItem('productData'));
      if (cachedData) {
        setProductData(cachedData);
      } else {
        const data = await fetcher('/api/products/get-product-related-info');
        localStorage.setItem('productData', JSON.stringify(data));
        setProductData(data);
      }
    };
    loadProductData();
  }, []);

  if (!productData) return <div>Loading...</div>;

  const { colors, sizes } = productData;

  const imagesError = errors?.variants?.[variantIndex]?.images;
  const imagesTouched = touched?.variants?.[variantIndex]?.images;

  const sizeNames = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double Extra Large',
  };

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
              condition={
                touched.variants &&
                touched.variants[variantIndex] &&
                errors.variants &&
                errors.variants[variantIndex]?.price
              }
            />
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <Label className="font-bold flex flex-row items-center" htmlFor="color">Color <Asterisk className="w-4"/></Label>
            <Select
              value={values.variants[variantIndex].color}
              onValueChange={(value) => {
                setFieldValue(`variants.${variantIndex}.color`, value);
              }}
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
              condition={
                touched.variants &&
                touched.variants[variantIndex] &&
                errors.variants &&
                errors.variants[variantIndex]?.color
              }
            />
          </div>
        </div>
        <div className="mb-4 flex flex-col gap-3">
          <Label className="font-bold flex flex-row items-center">Size <Asterisk className="w-4"/></Label>
          <ToggleGroup type="multiple" className="flex justify-start gap-2">
            {sizes.map((size) => (
              <ToggleGroupItem
              key={size.id}
              value={size.abbreviation}
              variant="outline"
              selected={values.variants[variantIndex].sizes?.includes(size.abbreviation) || false}
              onClick={() => {
                const isSelected = values.variants[variantIndex].sizes?.includes(size.abbreviation);
            
                // Toggle size selection
                const updatedSizes = isSelected
                  ? values.variants[variantIndex].sizes.filter((s) => s !== size.abbreviation)
                  : [...(values.variants[variantIndex].sizes || []), size.abbreviation];
                setFieldValue(`variants.${variantIndex}.sizes`, updatedSizes);
                setFieldTouched(`variants.${variantIndex}.sizes`, true);
            
                // Initialize quantities if not already set
                if (!values.variants[variantIndex].quantities) {
                  setFieldValue(`variants.${variantIndex}.quantities`, {});
                }
            
                // Update quantities based on size selection
                if (isSelected) {
                  // If size is being deselected, remove it from quantities
                  const updatedQuantities = { ...values.variants[variantIndex].quantities };
                  delete updatedQuantities[size.abbreviation];
                  setFieldValue(`variants.${variantIndex}.quantities`, updatedQuantities);

                  // Remove specific measurements for this size
                  const updatedMeasurements = { ...values.measurementsBySize };
                  delete updatedMeasurements[size.abbreviation];
                  setFieldValue("measurementsBySize", updatedMeasurements);
                } 
                else {
                  // If size is selected, add a field for its quantity
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
            condition={
              touched.variants &&
              touched.variants[variantIndex] &&
              errors.variants &&
              errors.variants[variantIndex]?.sizes
            }
          />
        </div>

        {values.variants[variantIndex].sizes?.map((size) => (
          <div key={size} className="border-t-2 border-t-border border-dashed py-4 mt-4">
            <h3 className="font-semibold text-lg mb-2">{`Quantity for Size - ${sizeNames[size] || size}`}</h3>

            {/* Quantity Field */}
            <div className="flex-1 flex flex-col gap-3 mb-5">
              <Label className="font-bold flex flex-row items-center" htmlFor={`variants.${variantIndex}.quantities.${size}`}>Quantity <Asterisk className="w-4"/></Label>
              <Input 
                id={`variants.${variantIndex}.quantities.${size}`}
                type="number"
                placeholder="Enter quantity"
                value={values.variants[variantIndex].quantities?.[size] || ""}
                onChange={(e) => {
                  setFieldValue(`variants.${variantIndex}.quantities.${size}`, e.target.value);
                  setFieldTouched(`variants.${variantIndex}.quantities.${size}`, true);
                }}    
                className={InputErrorStyle(errors.variants?.[variantIndex]?.quantities?.[size], touched.variants?.[variantIndex]?.quantities?.[size])}                
              />
              <InputErrorMessage
                error={errors.variants?.[variantIndex]?.quantities?.[size]}
                touched={touched.variants?.[variantIndex]?.quantities?.[size]}
              />
            </div>
          </div>
        ))}

      </Card>
    </div>
  );
}
