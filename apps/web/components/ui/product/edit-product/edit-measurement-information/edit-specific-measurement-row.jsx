import { useState } from "react";
import { FieldArray } from "formik";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Asterisk, Loader, CheckCircle2, X } from "lucide-react";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function EditSpecificMeasurementRow({
  measurementsData,
  measurements,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  handleChange,
  sizes, // Ordered provider sizes.
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  const [deleteAlertMessage, setDeleteAlertMessage] = useState("");

  if (!measurementsData || !measurementsData.measurements) {
    return null;
  }

  // Provider measurement definitions
  const availableMeasurements = measurementsData.measurements;
  const orderedProviderSizes = Array.isArray(sizes) ? sizes : [];

  async function handleConfirmDelete() {
    const measurementToDelete = measurements[currentRowIndex];
    // Gather all productMeasurementIds from this row.
    const measurementIds = measurementToDelete.values
      .map((v) => v.productMeasurementId)
      .filter((id) => id); // only truthy IDs
    console.log(measurementIds)
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/products/delete-product-measurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: measurementIds }),
      });
      if (response.ok) {
        // Remove the measurement row from Formik using FieldArray's remove.
        removeMeasurement(currentRowIndex);
        setDeleteAlertMessage("Product Measurement Deleted");
        setDeleteAlertVisible(true);
      } else {
        console.error("Failed to delete measurement");
      }
    } catch (error) {
      console.error("Error deleting measurement", error);
    } finally {
      setDeleteLoading(false);
      setDialogOpen(false);
      // Auto-hide alert after 3 seconds.
      setTimeout(() => setDeleteAlertVisible(false), 3000);
    }
  }

  // We'll define a helper to remove a measurement row from Formik.
  // This function will be provided by FieldArray.
  let removeMeasurement = () => {};

  return (
    <Card className="flex flex-col p-5">
      <FieldArray name="measurements">
        {({ remove }) => {
          removeMeasurement = remove; // expose the remove function
          return (
            <>
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    {/* First column: measurement name from provider */}
                    <TableHead className="border px-4 py-2 text-left">
                      <div className="flex items-center">
                        Measurement <Asterisk className="w-4" />
                      </div>
                    </TableHead>
                    {/* Columns for each size from provider */}
                    {orderedProviderSizes.map((size) => (
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
                    if (!measurement.measurementName) return null;
                    if (
                      !measurement.values ||
                      !measurement.values.some(
                        (v) => v.value && v.value.trim() !== ""
                      )
                    ) {
                      return null;
                    }
                    const rowError = errors?.[index] || {};
                    const rowTouched = touched?.[index] || {};
                    const providerMeasurement =
                      availableMeasurements[index] || {};
                    return (
                      <TableRow key={index}>
                        <TableCell className="border px-4 py-2">
                          <div className="font-medium">
                            {providerMeasurement.name || "N/A"}
                          </div>
                          <InputErrorMessage
                            error={rowError?.measurementName}
                            touched={rowTouched?.measurementName}
                          />
                        </TableCell>
                        {orderedProviderSizes.map((size) => {
                          const valueObj = measurement.values.find(
                            (v) => v.size === size.abbreviation
                          ) || { value: "" };
                          const rowErrorValues = Array.isArray(rowError.values)
                            ? rowError.values
                            : [];
                          const rowTouchedValues = Array.isArray(
                            rowTouched.values
                          )
                            ? rowTouched.values
                            : [];
                          const sizeError = rowErrorValues.find(
                            (v) => v.size === size.abbreviation
                          )?.value;
                          const sizeTouched = rowTouchedValues.find(
                            (v) => v.size === size.abbreviation
                          )?.value;
                          return (
                            <TableCell
                              key={size.abbreviation}
                              className="border px-4 py-2"
                            >
                              <Input
                                placeholder="Value in CM"
                                value={valueObj.value}
                                onChange={(e) => {
                                  const newValues = measurement.values.map(
                                    (v) =>
                                      v.size === size.abbreviation
                                        ? { ...v, value: e.target.value }
                                        : v
                                  );
                                  setFieldValue(
                                    `measurements.${index}.values`,
                                    newValues
                                  );
                                }}
                                onBlur={handleBlur}
                                className={InputErrorStyle(
                                  sizeError,
                                  sizeTouched
                                )}
                              />
                              <InputErrorMessage
                                error={sizeError}
                                touched={sizeTouched}
                              />
                            </TableCell>
                          );
                        })}
                        <TableCell className="border min-w-14 max-w-14 text-center">
                          {index > 0 && (
                            <Button
                              variant="destructive"
                              type="button"
                              className="text-red-500 bg-red-500/10 hover:bg-red-500/25 w-10 transition-all duration-500 ease-in-out active:scale-90"
                              onClick={() => {
                                setCurrentRowIndex(index);
                                setDialogOpen(true);
                              }}
                            >
                              <Trash2 className="scale-110 stroke-[2px]" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Measurement</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this row?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      className="w-20"
                      onClick={handleConfirmDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Loader className="animate-spin w-5 h-5" />
                      ) : (
                        "Yes"
                      )}
                    </Button>
                    <Button
                      className="w-20"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={deleteLoading}
                    >
                      No
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          );
        }}
      </FieldArray>
      {deleteAlertVisible && (
        <Alert className="fixed z-50 w-[30rem] right-12 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Product Measurement Deleted
            </AlertTitle>
            <AlertDescription className="text-green-300">
              The product measurements have been deleted successfully.
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto mr-4"
            onClick={() => setDeleteAlertVisible(false)}
          >
            <X className="-translate-x-[0.85rem]" />
          </Button>
        </Alert>
      )}
    </Card>
  );
}
