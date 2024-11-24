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
import { Check, Asterisk } from "lucide-react";
import { useEffect, useContext, useState } from "react";
import { FormContext } from "@/providers/form-provider";

export default function ShopInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [loaded, setLoaded] = useState(false); // Track loading of saved data

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
      businessLicense: [], // Use context data
    },
    validationSchema: shopInfoSchema,
    onSubmit: (values) => {
      updateFormData(values);
      localStorage.setItem("shopInfo", JSON.stringify(values)); // Save inputs to localStorage
      document.cookie = "currentStep=3; path=/";
      router.push(routes.partnership3);
    },
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("shopInfo"));
    if (savedData) {
      formik.setValues(savedData); // Populate form with saved data
    }
    setLoaded(true); // Mark as loaded
  }, []);

  // Save data to localStorage whenever formik.values change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("shopInfo", JSON.stringify(formik.values));
    }
  }, [formik.values, loaded]);

  if (!loaded) {
    return null; // Prevent rendering until saved data is loaded
  }

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
            <LabelAndInput label="Shop Name" name="shopName" placeholder="Enter the shop name" formik={formik} required={true} />
            <LabelAndInput label="Shop Contact Number" name="shopContactNo" placeholder="Enter the shop contact number" formik={formik} required={true} />
            <div className="flex flex-col gap-3">
              <Label htmlFor="businessLicense" className="font-bold flex flex-row items-center">Business License <Asterisk className="w-4" /></Label>
              <FileUpload
                onFileSelect={(files) => formik.setFieldValue("businessLicense", files)}
                initialFiles={formik.values.businessLicense}
                className={formik.errors.businessLicense && formik.touched.businessLicense ? "border-red-500" : "border-border"}
              />
              <InputErrorMessage error={formik.errors.businessLicense} touched={formik.touched.businessLicense} />
            </div>
          </div>
          <CardTitle className="text-2xl">Shop Address Information</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <LabelAndInput label="Building Number" name="buildingNo" placeholder="Enter the building number" formik={formik} />
            <LabelAndInput label="Street" name="street" placeholder="Enter the street" formik={formik} />
            <LabelAndInput label="Barangay" name="barangay" placeholder="Enter the barangay" formik={formik} required={true} />
            <LabelAndInput label="Municipality" name="municipality" placeholder="Enter the municipality" formik={formik} required={true} />
            <LabelAndInput label="Province" name="province" placeholder="Enter the province" formik={formik} required={true} />
            <LabelAndInput label="Postal Number" name="postalNumber" placeholder="Enter the postal number" formik={formik} required={true} />
          </div>

          <Button type="submit" className="w-full mt-4">Next</Button>
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}

// Helper Component for Input Fields
function LabelAndInput({ label, name, placeholder, formik, required = false }) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className={`font-bold flex flex-row items-center ${required ? "" : "font-bold"}`}>
        {label} 
        {required && <Asterisk className="w-4" />}
      </Label>
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
