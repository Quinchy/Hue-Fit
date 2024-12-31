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
  const measurementLimit = measurementsData.count;
  const selectedOrderedSizes = sizes.filter((size) =>
    selectedSizes.includes(size.abbreviation)
  );

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
                {measurements.map((measurement, index) => (
                  <TableRow key={index}>
                    <TableCell className="border px-4 py-2">
                      <Select
                        onValueChange={(value) =>
                          setFieldValue(`measurements.${index}.measurementName`, value)
                        }
                        value={measurement.measurementName || ""}
                      >
                        <SelectTrigger
                          className={`w-full ${InputErrorStyle(
                            errors?.[index]?.measurementName,
                            touched?.[index]?.measurementName
                          )}`}
                        >
                          <SelectValue placeholder="Select measurement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {measurementsData.measurements.map((option) => (
                              <SelectItem
                                key={option.name}
                                value={option.name}
                                disabled={measurements.some(
                                  (m, idx) =>
                                    idx !== index && m.measurementName === option.name
                                )}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <InputErrorMessage
                        error={errors?.[index]?.measurementName}
                        touched={touched?.[index]?.measurementName}
                      />
                    </TableCell>
                    {measurement.values.map((valObj, valIndex) => {
                      const currentSize = valObj.size;
                      return (
                        <TableCell
                          key={currentSize}
                          className="border px-4 py-2"
                        >
                          <Input
                            placeholder="Value in CM"
                            name={`measurements.${index}.values.${valIndex}.value`}
                            value={valObj.value}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={InputErrorStyle(
                              errors?.[index]?.values?.[valIndex]?.value,
                              touched?.[index]?.values?.[valIndex]?.value
                            )}
                          />
                          <InputErrorMessage
                            error={errors?.[index]?.values?.[valIndex]?.value}
                            touched={touched?.[index]?.values?.[valIndex]?.value}
                          />
                        </TableCell>
                      );
                    })}
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
                ))}
              </TableBody>
            </Table>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                const initialValues = selectedOrderedSizes.map((sz) => ({
                  size: sz.abbreviation,
                  value: ""
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
