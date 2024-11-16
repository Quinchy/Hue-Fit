// components/specific-measurements.jsx
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useFormikContext, FieldArray } from 'formik';
import { InputErrorMessage } from "@/components/ui/error-message";
import { InputErrorStyle } from "@/components/ui/error-message";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SpecificMeasurements({ formik, productType }) {
  const [measurementsData, setMeasurementsData] = useState(null);
  const [productData, setProductData] = useState(null);

  const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext() || {};

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

  // Collect all sizes selected in any variant
  const selectedSizes = [...new Set(values.variants.flatMap(variant => variant.sizes))];

  // Initialize measurementsBySize for new sizes
  useEffect(() => {
    selectedSizes.forEach((size) => {
      if (!values.measurementsBySize[size]) {
        setFieldValue(`measurementsBySize.${size}`, {
          measurements: [{ measurementName: '', value: '', unitName: '' }],
        });
      } else if (!values.measurementsBySize[size].measurements || values.measurementsBySize[size].measurements.length === 0) {
        setFieldValue(`measurementsBySize.${size}.measurements`, [{ measurementName: '', value: '', unitName: '' }]);
      }
    });
  }, [selectedSizes]);

  if (!measurementsData || !productData) return <div></div>;

  const { units } = productData;
  const measurements = measurementsData.measurements;
  const measurementLimit = measurementsData.count;

  const sizeNames = {
    XS: 'Extra Small',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'Extra Large',
    XXL: 'Double Extra Large',
  };

  return (
    <div className="flex flex-col gap-5">
      {selectedSizes.map((size) => (
        <Card key={size} className="p-5">
          <h3 className="font-semibold text-lg mb-4">{`Specific Measurements - ${sizeNames[size] || size}`}</h3>

          {/* Specific Measurements Mapping */}
          <FieldArray name={`measurementsBySize.${size}.measurements`}>
            {({ push, remove }) => (
              <>
                {values.measurementsBySize[size]?.measurements?.map((measurement, index) => {
                  const selectedMeasurementNames = values.measurementsBySize[size]?.measurements
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
                              `measurementsBySize.${size}.measurements.${index}.measurementName`,
                              value
                            )
                          }
                        >
                          <SelectTrigger className={`w-full 
                            ${InputErrorStyle(errors.measurementsBySize?.[size]?.measurements?.[index]?.measurementName, 
                              touched.measurementsBySize?.[size]?.measurements?.[index]?.measurementName)}`}
                          >
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
                          error={errors.measurementsBySize?.[size]?.measurements?.[index]?.measurementName}
                          touched={touched.measurementsBySize?.[size]?.measurements?.[index]?.measurementName}
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
                              `measurementsBySize.${size}.measurements.${index}.value`,
                              e.target.value
                            )
                          }
                          className={
                            InputErrorStyle(errors.measurementsBySize?.[size]?.measurements?.[index]?.value, 
                            touched.measurementsBySize?.[size]?.measurements?.[index]?.value
                          )}
                        />
                        <InputErrorMessage
                          error={errors.measurementsBySize?.[size]?.measurements?.[index]?.value}
                          touched={touched.measurementsBySize?.[size]?.measurements?.[index]?.value}
                        />
                      </div>

                      {/* Unit Selection */}
                      <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                        <Label>Unit</Label>
                        <Select
                          value={measurement.unitName || ""}
                          onValueChange={(value) =>
                            setFieldValue(
                              `measurementsBySize.${size}.measurements.${index}.unitName`,
                              value
                            )
                          }
                        >
                          <SelectTrigger className={`w-full 
                            ${InputErrorStyle(errors.measurementsBySize?.[size]?.measurements?.[index]?.unitName, 
                              touched.measurementsBySize?.[size]?.measurements?.[index]?.unitName)}`}
                        >
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
                          error={errors.measurementsBySize?.[size]?.measurements?.[index]?.unitName}
                          touched={touched.measurementsBySize?.[size]?.measurements?.[index]?.unitName}
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
                {values.measurementsBySize[size]?.measurements?.length < measurementLimit && (
                  <Button variant="outline" type="button" className="w-full mt-2" onClick={() => {
                    push({ measurementName: '', value: '', unitName: '' });
                  }}>
                    Add Specific Measurement
                  </Button>
                )}
              </>
            )}
          </FieldArray>
        </Card>
      ))}
    </div>
  );
}
