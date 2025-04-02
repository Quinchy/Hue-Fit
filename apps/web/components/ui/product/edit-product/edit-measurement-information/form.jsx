import { CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";
import EditSpecificMeasurementRow from "./edit-specific-measurement-row";

export default function EditMeasurementInformation({
  measurementData,
  measurementLoading,
  values,
  errors,
  touched,
  setFieldValue,
  handleBlur,
  handleChange,
  orderedSizes,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-5">
        <CardTitle className="text-2xl min-w-[22.9rem]">
          Measurement Information
        </CardTitle>
        <div className="h-[1px] w-full bg-primary/30 mt-2"></div>
      </div>
      {measurementLoading && (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin" />
          <span className="ml-2">Loading measurements...</span>
        </div>
      )}
      {!measurementLoading && measurementData && (
        <EditSpecificMeasurementRow
          measurementsData={measurementData}
          measurements={values.measurements}
          errors={errors.measurements}
          touched={touched.measurements}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          handleChange={handleChange}
          sizes={orderedSizes}
        />
      )}
    </div>
  );
}
