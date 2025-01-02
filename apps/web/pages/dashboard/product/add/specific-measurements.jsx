// specific-measurements.jsx
import { FieldArray } from "formik";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Asterisk } from "lucide-react";
import {
  InputErrorMessage,
  InputErrorStyle
} from "@/components/ui/error-message";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

/*
  We ensure that if `measurementsData` or `measurementsData.measurements` is undefined,
  we safely return null to avoid SSR prerender errors.
*/

export default function SpecificMeasurements({
  measurementsData,
  selectedSizes,
  measurements,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  handleChange,
  sizes
}) {
  // If there's no data or no array of measurements, safely return null
  if (!measurementsData || !measurementsData.measurements) {
    return null;
  }

  const measurementLimit = measurementsData?.count || 10;
  const availableMeasurements = measurementsData.measurements;

  // Safely handle the sizes array
  const selectedOrderedSizes = Array.isArray(sizes)
    ? sizes.filter((size) => Array.isArray(selectedSizes) && selectedSizes.includes(size.abbreviation))
    : [];

  return (
    <Card className="flex flex-col p-5">
      <FieldArray name="measurements">
        {({ remove, push }) => (
          <>
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="border px-4 py-2 text-left">
                    <div className="flex items-center">
                      Measurement <Asterisk className="w-4" />
                    </div>
                  </TableHead>
                  {selectedOrderedSizes.map((size) => (
                    <TableHead
                      key={size.abbreviation}
                      className="border px-2 py-2 text-left"
                    >
                      <div className="flex items-center">
                        {`${size.name} (${size.abbreviation})`}
                        <Asterisk className="w-4" />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-14 max-w-14 border"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {measurements.map((measurement, index) => {
                  const rowError = errors?.[index];
                  const rowTouched = touched?.[index];

                  return (
                    <TableRow key={index}>
                      {/* Measurement Name */}
                      <TableCell className="border px-4 py-2">
                        <Select
                          onValueChange={(val) =>
                            setFieldValue(`measurements.${index}.measurementName`, val)
                          }
                          value={measurement.measurementName || ""}
                        >
                          <SelectTrigger
                            className={`w-full ${InputErrorStyle(
                              rowError?.measurementName,
                              rowTouched?.measurementName
                            )}`}
                          >
                            <SelectValue placeholder="Select measurement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {availableMeasurements.map((option) => (
                                <SelectItem
                                  key={option.name}
                                  value={option.name}
                                  disabled={measurements.some(
                                    (m, idx2) =>
                                      idx2 !== index &&
                                      m.measurementName === option.name
                                  )}
                                >
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <InputErrorMessage
                          error={rowError?.measurementName}
                          touched={rowTouched?.measurementName}
                        />
                      </TableCell>

                      {/* Measurement Values Per Size */}
                      {measurement.values.map((valObj, valIndex) => {
                        const valError = rowError?.values?.[valIndex]?.value;
                        const valTouched = rowTouched?.values?.[valIndex]?.value;

                        return (
                          <TableCell
                            key={valObj.size}
                            className="border px-4 py-2"
                          >
                            <Input
                              placeholder="Value in CM"
                              name={`measurements.${index}.values.${valIndex}.value`}
                              value={valObj.value}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={InputErrorStyle(valError, valTouched)}
                            />
                            <InputErrorMessage error={valError} touched={valTouched} />
                          </TableCell>
                        );
                      })}

                      {/* Remove Row Button */}
                      <TableCell className="border min-w-14 max-w-14 text-center">
                        <Button
                          variant="ghost"
                          type="button"
                          className="text-red-500 hover:bg-red-500 w-10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="scale-110 stroke-[2px]" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Add Measurement Button */}
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                // Safely build initialValues based on the selectedOrderedSizes
                const initialValues = selectedOrderedSizes.map((sz) => ({
                  size: sz.abbreviation,
                  value: "",
                }));
                push({ measurementName: "", values: initialValues });
              }}
              disabled={measurements.length >= measurementLimit}
              className="w-full mt-4"
            >
              <Plus className="scale-110 stroke-[3px] mr-2" />
              Add Measurement
            </Button>
          </>
        )}
      </FieldArray>
    </Card>
  );
}
