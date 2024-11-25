// components/specific-measurements.jsx
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Asterisk } from 'lucide-react';
import { useFormikContext, FieldArray } from 'formik';
import { InputErrorMessage } from "@/components/ui/error-message";
import { InputErrorStyle } from "@/components/ui/error-message";
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SpecificMeasurements({ formik, productType }) {
  const { values, setFieldValue, setFieldTouched, errors, touched } = useFormikContext() || {};

  // Fetch product-related data using useSWR
  const { data: productData, error: productError } = useSWR(
    `/api/products/get-product-related-info`,
    fetcher
  );

  // Dynamically fetch measurements based on productType
  const typeName = productData?.types.find((type) => type.id === parseInt(productType))?.name;

  const { data: measurementsData, error: measurementsError } = useSWR(
    typeName ? `/api/products/get-measurement-by-type?productType=${typeName}` : null,
    fetcher
  );

  const getTypeNameById = (id) => {
    const type = productData.types.find((t) => t.id === parseInt(id));
    return type ? type.name : '';
  };

  // Collect all sizes selected in any variant
  const selectedSizes = [...new Set((values?.variants || []).flatMap(variant => variant.sizes || []))];

  // Initialize measurementsBySize for new sizes
  useEffect(() => {
    if (!values?.measurementsBySize) return; 
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

  const { units, sizes } = productData;
  const measurements = measurementsData.measurements;
  const measurementLimit = measurementsData.count;

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

  const orderedSizes = orderSizes(sizes);

  const abbreviationToSizeMap = new Map();
  orderedSizes.forEach(size => {
    abbreviationToSizeMap.set(size.abbreviation, size);
  });

  const selectedOrderedSizes = orderedSizes.filter(size => selectedSizes.includes(size.abbreviation));

  return (
    <div className="flex flex-col gap-5">
      {selectedOrderedSizes.map((sizeObj) => {
        const sizeAbbreviation = sizeObj.abbreviation;
        const sizeName = sizeObj.name;

        return (
          <Card key={sizeAbbreviation} className="p-5">
            <h3 className="font-semibold text-lg mb-4">{`Specific Measurements - ${sizeName || sizeAbbreviation}`}</h3>

            {/* Specific Measurements Mapping */}
            <FieldArray name={`measurementsBySize.${sizeAbbreviation}.measurements`}>
              {({ push, remove }) => (
                <>
                  {values.measurementsBySize[sizeAbbreviation]?.measurements?.map((measurement, index) => {
                    const selectedMeasurementNames = values.measurementsBySize[sizeAbbreviation]?.measurements
                      ?.map((m, idx) => idx !== index ? m.measurementName : null)
                      ?.filter(Boolean) || [];

                    return (
                      <div key={index} className="flex flex-row mb-5 gap-3 items-start min-h-[8rem]">
                        {/* Measurement Name */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label  className="font-bold flex flex-row items-center">Measurement <Asterisk className="w-4"/></Label>
                          <Select
                            value={measurement.measurementName || ""}
                            onValueChange={(value) =>
                              setFieldValue(
                                `measurementsBySize.${sizeAbbreviation}.measurements.${index}.measurementName`,
                                value
                              )
                            }
                          >
                            <SelectTrigger className={`w-full 
                              ${InputErrorStyle(errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.measurementName, 
                                touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.measurementName)}`}
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
                            error={errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.measurementName}
                            touched={touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.measurementName}
                          />
                        </div>

                        {/* Value Input */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label className="font-bold flex flex-row items-center">Value <Asterisk className="w-4"/></Label>
                          <Input
                            placeholder="Value"
                            value={measurement.value || ""}
                            onChange={(e) =>
                              setFieldValue(
                                `measurementsBySize.${sizeAbbreviation}.measurements.${index}.value`,
                                e.target.value
                              )
                            }
                            className={
                              InputErrorStyle(errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.value, 
                              touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.value
                            )}
                          />
                          <InputErrorMessage
                            error={errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.value}
                            touched={touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.value}
                          />
                        </div>

                        {/* Unit Selection */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[8rem]">
                          <Label className="font-bold flex flex-row items-center">Unit <Asterisk className="w-4"/></Label>
                          <Select
                            value={measurement.unitName || ""}
                            onValueChange={(value) =>
                              setFieldValue(
                                `measurementsBySize.${sizeAbbreviation}.measurements.${index}.unitName`,
                                value
                              )
                            }
                          >
                            <SelectTrigger className={`w-full 
                              ${InputErrorStyle(errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.unitName, 
                                touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.unitName)}`}
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
                            error={errors.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.unitName}
                            touched={touched.measurementsBySize?.[sizeAbbreviation]?.measurements?.[index]?.unitName}
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
                  {values.measurementsBySize[sizeAbbreviation]?.measurements?.length < measurementLimit && (
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
        );
      })}
    </div>
  );
}
