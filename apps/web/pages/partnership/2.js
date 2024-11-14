import { useFormik } from "formik";
import { shopInfoSchema } from "@/utils/validation-schema";
import { useRouter } from "next/router";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import FileUpload from "@/components/ui/file-upload";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check } from 'lucide-react';
import { useEffect } from "react";

export default function ShopInformationStep() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      shopName: "",
      shopContactNo: "",
      buildingNo: "",
      street: "",
      barangay: "",
      municipality: "",
      province: "",
      postalNumber: "",
      businessLicense: [], // Initially empty array for business licenses
    },
    validationSchema: shopInfoSchema,
    onSubmit: (values) => {
      const formData = new FormData();

      // Append other fields
      for (const key in values) {
        if (key !== 'businessLicense') {
          formData.append(key, values[key]);
        }
      }

      // Append business license URLs to FormData (multiple files handled)
      values.businessLicense.forEach((url, index) => {
        formData.append(`businessLicense[${index}]`, url); // Adding each file URL
      });

      // Log FormData entries to debug
      for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      // Log values before saving to sessionStorage
      console.log('Formik values:', values);

      const previousData = JSON.parse(sessionStorage.getItem("partnershipData")) || {};
      sessionStorage.setItem("partnershipData", JSON.stringify({ ...previousData, ...values }));
      document.cookie = "currentStep=3; path=/";
      router.push(routes.partnership3);
      console.log('Session Storage:', JSON.parse(sessionStorage.getItem("partnershipData")));
    },
  });

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("partnershipData") || "{}");
    formik.setValues(savedData);
  }, []);

  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      <div className="flex flex-row items-center">
        <div className="p-2 border-2 border-primary rounded-full"><Check /></div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-1 border-2 border-primary rounded-full"><div className="p-3.5 bg-primary rounded-full"></div></div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
      </div>
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 p-5">
          <CardTitle className="text-2xl">Shop Information</CardTitle>
          <div className="flex flex-col gap-4">
            <LabelAndInput label="Shop Name" name="shopName" placeholder="Enter the shop name" formik={formik} />
            <LabelAndInput label="Shop Contact Number" name="shopContactNo" placeholder="Enter the shop contact number" formik={formik} />
            <div className="flex flex-col gap-3">
              <Label htmlFor="businessLicense">Business License</Label>
              <FileUpload
                onFileSelect={(files) => formik.setFieldValue("businessLicense", files)}
                className={formik.errors.businessLicense && formik.touched.businessLicense ? "border-red-500" : "border-border"}
              />
              <InputErrorMessage error={formik.errors.businessLicense} touched={formik.touched.businessLicense} />
            </div>
          </div>
          <CardTitle className="text-2xl">Shop Address Information</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <LabelAndInput label="Building Number" name="buildingNo" placeholder="Enter the building number" formik={formik} />
            <LabelAndInput label="Street" name="street" placeholder="Enter the street" formik={formik} />
            <LabelAndInput label="Barangay" name="barangay" placeholder="Enter the barangay" formik={formik} />
            <LabelAndInput label="Municipality" name="municipality" placeholder="Enter the municipality" formik={formik} />
            <LabelAndInput label="Province" name="province" placeholder="Enter the province" formik={formik} />
            <LabelAndInput label="Postal Number" name="postalNumber" placeholder="Enter the postal number" formik={formik} />
          </div>

          <Button type="submit" className="w-full mt-4">Next</Button>
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}

// Helper Component for Input Fields
function LabelAndInput({ label, name, placeholder, formik }) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        placeholder={placeholder}
        {...formik.getFieldProps(name)}
        className={InputErrorStyle(formik.errors[name], formik.touched[name])}
      />
      <InputErrorMessage error={formik.errors[name]} touched={formik.touched[name]} />
    </div>
  );
}
