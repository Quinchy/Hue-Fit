"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import useSWR from "swr";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { MoveLeft, Asterisk, CheckCircle2 } from "lucide-react";
import routes from "@/routes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define a simple fetcher for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

// Validation schema for feeType and feeAmount
const feeSchema = Yup.object().shape({
  feeType: Yup.string()
    .oneOf(["fixed", "percentage"], "Fee Type is required")
    .required("Fee Type is required"),
  feeAmount: Yup.number()
    .typeError("Fee Amount must be a number")
    .positive("Fee Amount must be positive")
    .required("Fee Amount is required"),
});

export default function DeliveryFeeMaintenance() {
  const router = useRouter();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch the current fee from the API
  const { data: feeData, error } = useSWR(
    "/api/maintenance/fee/get-fee",
    fetcher
  );

  // The form uses default values (without prepopulating current fee)
  const formik = useFormik({
    initialValues: {
      feeType: "fixed", // default value
      feeAmount: "",
    },
    validationSchema: feeSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      // Convert feeType to uppercase for storage ("FIXED" or "PERCENTAGE")
      const payload = {
        feeType: values.feeType.toUpperCase(),
        feeAmount: parseFloat(values.feeAmount),
      };

      try {
        await axios.post("/api/maintenance/fee/create-fee", payload);
        setSuccessMessage("Global delivery fee updated successfully!");
        setShowSuccessAlert(true);
        resetForm();
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCancel = () => {
    router.push(routes.order);
  };

  return (
    <DashboardLayoutWrapper>
      {/* Top-level header bar */}
      <div className="flex justify-between items-center">
        <div className="flex flex-row items-center gap-4">
          <CardTitle className="text-4xl">Global Delivery Fee</CardTitle>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <MoveLeft className="scale-125" />
          Back to Orders
        </Button>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="fixed z-50 w-[30rem] right-10 bottom-10 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Global Delivery Fee Updated
            </AlertTitle>
            <AlertDescription className="text-green-300">
              {successMessage}
            </AlertDescription>
          </div>
          <button
            className="ml-auto mr-4 hover:text-primary/50 focus:outline-none"
            onClick={() => setShowSuccessAlert(false)}
          >
            ✕
          </button>
        </Alert>
      )}

      {/* Main Card for the Update Form */}
      <Card className="p-10 flex flex-col gap-8 mb-20">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-semibold">
            Current Delivery Fee
          </CardTitle>
          {error ? (
            <p className="text-red-500">Error fetching current fee.</p>
          ) : feeData && feeData.fee ? (
            <div className="flex flex-col">
              <p>
                <span className="font-bold">Type:</span>{" "}
                {feeData.fee.feeType === "FIXED" ? "Fixed Amount" : "Percentage"}
              </p>
              <p>
                <span className="font-bold">Amount:</span> {feeData.fee.feeAmount}
                {feeData.fee.feeType === "PERCENTAGE" && " %"}
              </p>
            </div>
          ) : (
            <p className="font-light text-muted-foreground">No delivery fee has been set yet.</p>
          )}
        </div>
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold">
              Update Delivery Fee Parameters
            </CardTitle>
            <div className="flex flex-col gap-4">
              <div>
                <Label className="font-bold flex flex-row items-center">
                  Fee Type <Asterisk className="w-4" />
                </Label>
                <RadioGroup
                  value={formik.values.feeType}
                  onValueChange={(value) =>
                    formik.setFieldValue("feeType", value)
                  }
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fixed" id="fixedFee" />
                    <Label
                      htmlFor="fixedFee"
                      className="font-bold flex flex-row items-center"
                    >
                      Fixed Amount
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="percentage" id="percentageFee" />
                    <Label
                      htmlFor="percentageFee"
                      className="font-bold flex flex-row items-center"
                    >
                      Percentage
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="feeAmount"
                  className="font-bold flex flex-row items-center"
                >
                  Fee Amount{" "}
                  {formik.values.feeType === "percentage"
                    ? "( in % )"
                    : "( in Currency )"}{" "}
                  <Asterisk className="w-4" />
                </Label>
                <Input
                  id="feeAmount"
                  type="number"
                  placeholder={
                    formik.values.feeType === "percentage"
                      ? "e.g. 10"
                      : "e.g. 50.00"
                  }
                  value={formik.values.feeAmount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(
                    formik.errors.feeAmount,
                    formik.touched.feeAmount
                  )}
                />
                {formik.touched.feeAmount && formik.errors.feeAmount && (
                  <InputErrorMessage
                    error={formik.errors.feeAmount}
                    touched={formik.touched.feeAmount}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              className="w-1/5"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayoutWrapper>
  );
}
