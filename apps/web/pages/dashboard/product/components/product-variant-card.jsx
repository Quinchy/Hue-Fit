// product-variant-card.jsx
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductVariantPictures from './product-variant-pictures';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useFormikContext, FieldArray } from 'formik';
import { InputErrorMessage } from "@/components/ui/error-message";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProductVariantCardWithMeasurements({ variant, productType, onRemove, variantIndex }) {
  const [productData, setProductData] = useState(null);
  const [measurementsData, setMeasurementsData] = useState(null);

  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const sizeNames = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double Extra Large',
  };
  const { values, setFieldValue, setFieldTouched, getFieldProps, errors, touched } = useFormikContext();

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

  useEffect(() => {
    if (!productType) return;
    const loadMeasurementsData = async () => {
      const cachedMeasurements = JSON.parse(localStorage.getItem(`measurementsData-${productType}`));
      if (cachedMeasurements) {
        setMeasurementsData(cachedMeasurements);
      } else {
        const data = await fetcher(`/api/products/get-measurement-by-type?productType=${productType}`);
        localStorage.setItem(`measurementsData-${productType}`, JSON.stringify(data));
        setMeasurementsData(data);
      }
    };
    loadMeasurementsData();
  }, [productType]);

  if (!productData || !measurementsData) return <div>Loading...</div>;

  const { colors, sizes, units } = productData;
  const measurements = measurementsData.measurements;
  const measurementLimit = measurementsData.count;

  const toggleSize = (size) => {
    const isSelected = values.variants[variantIndex].sizes?.includes(size);
    const updatedSizes = isSelected
      ? values.variants[variantIndex].sizes.filter((s) => s !== size)
      : [...(values.variants[variantIndex].sizes || []), size];

    setFieldValue(`variants.${variantIndex}.sizes`, updatedSizes);
    setFieldTouched(`variants.${variantIndex}.sizes`, true);

    if (isSelected) {
      const measurementsBySize = { ...values.variants[variantIndex].measurementsBySize };
      delete measurementsBySize[size];
      setFieldValue(`variants.${variantIndex}.measurementsBySize`, measurementsBySize);
    } else if (!values.variants[variantIndex].measurementsBySize[size]) {
      setFieldValue(`variants.${variantIndex}.measurementsBySize.${size}`, {
        quantity: '',
        measurements: [],
      });
    }
  };

  const handleAddMeasurement = (size) => {
    const measurementsArray = values.variants[variantIndex].measurementsBySize[size]?.measurements || [];
    setFieldValue(`variants.${variantIndex}.measurementsBySize.${size}.measurements`, [
      ...measurementsArray,
      { measurementName: '', value: '', unitName: '' },
    ]);
  };

  const handleRemoveMeasurement = (size, index) => {
    const measurementsArray = values.variants[variantIndex].measurementsBySize[size]?.measurements || [];
    measurementsArray.splice(index, 1);
    setFieldValue(`variants.${variantIndex}.measurementsBySize.${size}.measurements`, measurementsArray);
  };

  const imagesError = errors?.variants?.[variantIndex]?.images;
  const imagesTouched = touched?.variants?.[variantIndex]?.images;

  return (
    <div className="flex flex-col gap-5 mb-5">
      <ProductVariantPictures variantIndex={variantIndex} />
      <InputErrorMessage
        error={imagesError}
        touched={imagesTouched}
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
            <Label htmlFor={`variants.${variantIndex}.price`}>Price</Label>
            <Input 
              id={`variants.${variantIndex}.price`}
              placeholder="Enter the price" 
              {...getFieldProps(`variants.${variantIndex}.price`)}
            />
            {touched.variants && touched.variants[variantIndex] && errors.variants && errors.variants[variantIndex]?.price ? (
              <div className="text-red-500 text-sm">{errors.variants[variantIndex].price}</div>
            ) : null}
          </div>
          <div className="flex-1 flex flex-col gap-3">
            <Label htmlFor="color">Color</Label>
            <Select
              value={values.variants[variantIndex].color}
              onValueChange={(value) => {
                setFieldValue(`variants.${variantIndex}.color`, value);
              }}
            >
              <SelectTrigger className="w-full">
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
            {touched.variants && touched.variants[variantIndex] && errors.variants && errors.variants[variantIndex]?.color ? (
              <div className="text-red-500 text-sm">{errors.variants[variantIndex].color}</div>
            ) : null}
          </div>
        </div>
        <div className="mb-4">
          <Label>Size</Label>
          <ToggleGroup type="multiple" className="flex justify-start gap-2">
            {sizes.map((size) => (
              <ToggleGroupItem
                key={size.id}
                value={size.abbreviation}
                variant="outline"
                selected={values.variants[variantIndex].sizes?.includes(size.abbreviation) || false}
                onClick={() => toggleSize(size.abbreviation)}
                className="min-w-14 min-h-14 border-2"
              >
                {size.abbreviation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {errors.variants?.[variantIndex]?.sizes && touched.variants?.[variantIndex]?.sizes && (
            <div className="text-red-500 text-sm">{errors.variants[variantIndex].sizes}</div>
          )}
        </div>
        {values.variants[variantIndex].sizes?.map((size) => (
          <div key={size} className="border-t-2 border-t-border border-dashed py-4 mt-4">
            <h3 className="font-semibold text-lg mb-2">{`Specific Measurements - ${sizeNames[size]}`}</h3>
            
            {/* Quantity Field */}
            <div className="flex-1 flex flex-col gap-3 mb-5">
              <Label htmlFor={`variants.${variantIndex}.measurementsBySize.${size}.quantity`}>Quantity</Label>
              <Input 
                id={`variants.${variantIndex}.measurementsBySize.${size}.quantity`}
                type="number"
                placeholder="Enter quantity"
                value={values.variants[variantIndex].measurementsBySize[size]?.quantity || ""}
                onChange={(e) => {
                  setFieldValue(`variants.${variantIndex}.measurementsBySize.${size}.quantity`, e.target.value);
                  setFieldTouched(`variants.${variantIndex}.measurementsBySize.${size}.quantity`, true);
                }}                    
              />
              <InputErrorMessage
                error={errors.variants?.[variantIndex]?.measurementsBySize?.[size]?.quantity}
                touched={touched.variants?.[variantIndex]?.measurementsBySize?.[size]?.quantity}
              />
            </div>

            {/* Specific Measurements Mapping */}
            <FieldArray name={`variants.${variantIndex}.measurementsBySize.${size}.measurements`}>
              {({ push, remove }) => (
                <>
                  {values.variants[variantIndex].measurementsBySize[size]?.measurements?.map((measurement, index) => {
                    const selectedMeasurementNames = values.variants[variantIndex].measurementsBySize[size]?.measurements
                      ?.map((m, idx) => idx !== index ? m.measurementName : null)
                      ?.filter(Boolean) || [];

                    return (
                      <div key={index} className="flex flex-row mb-5 gap-3 items-start min-h-[8rem]">
                        {/* Measurement Name */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label>Measurement</Label>
                          <Select
                            value={measurement.measurementName || ""}
                            onValueChange={(value) =>
                              setFieldValue(
                                `variants.${variantIndex}.measurementsBySize.${size}.measurements.${index}.measurementName`,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select specific measurement" />
                            </SelectTrigger>
                            <SelectContent>
                              {measurements.map((measurementOption) => (
                                <SelectItem
                                  key={measurementOption.name}
                                  value={measurementOption.name}
                                  disabled={selectedMeasurementNames.includes(measurementOption.name)}
                                >
                                  {measurementOption.name.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <InputErrorMessage
                            error={errors.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.measurementName}
                            touched={touched.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.measurementName}
                          />
                        </div>

                        {/* Value Input */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label>Value</Label>
                          <Input
                            placeholder="Value"
                            value={measurement.value || ""}
                            onChange={(e) =>
                              setFieldValue(
                                `variants.${variantIndex}.measurementsBySize.${size}.measurements.${index}.value`,
                                e.target.value
                              )
                            }
                          />
                          <InputErrorMessage
                            error={errors.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.value}
                            touched={touched.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.value}
                          />
                        </div>

                        {/* Unit Selection */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label>Unit</Label>
                          <Select
                            value={measurement.unitName || ""}
                            onValueChange={(value) =>
                              setFieldValue(
                                `variants.${variantIndex}.measurementsBySize.${size}.measurements.${index}.unitName`,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.name} value={unit.name}>
                                  {unit.name.toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <InputErrorMessage
                            error={errors.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.unitName}
                            touched={touched.variants?.[variantIndex]?.measurementsBySize?.[size]?.measurements?.[index]?.unitName}
                          />
                        </div>

                        <Button
                          variant="ghost"
                          type="button"
                          className="text-red-500 mt-[1.80rem] p-5 hover:bg-red-500 min-w-[3rem] min-h-[3rem]"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="scale-110 stroke-[2px]" />
                        </Button>
                      </div>
                    );
                  })}
                  {values.variants[variantIndex].measurementsBySize[size]?.measurements?.length < measurementLimit && (
                    <Button variant="outline" type="button" className="w-full mt-2" onClick={() => handleAddMeasurement(size)}>
                      <Plus className="scale-110 stroke-[3px]" /> Add Specific Measurement
                    </Button>
                  )}
                </>
              )}
            </FieldArray>
          </div>
        ))}
      </Card>
    </div>
  );
}
