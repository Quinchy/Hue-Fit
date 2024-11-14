// Step 4 Component (Account Information, Final Submission)
// File: 4.js
import { useEffect } from "react";
import { useFormik } from "formik";
import { accountInfoSchema } from "@/utils/validation-schema";
import { useRouter } from "next/router";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check } from 'lucide-react';

export default function AccountInformationStep() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: accountInfoSchema,
    onSubmit: async (values) => {
      const previousData = JSON.parse(sessionStorage.getItem("partnershipData")) || {};
      const completeData = { ...previousData, ...values };
      const formData = new FormData();
      console.log("Complete Data:", completeData);
      console.log("Form Data:", formData);
      if (values.businessLicense && values.businessLicense.length > 0) {
        values.businessLicense.forEach((file, index) => {
          // Check that file is of type `File`
          if (file instanceof File) {
            console.log(`Appending file: ${file.name}`);
            formData.append(`businessLicense[${index}]`, file, file.name);
          } else {
            console.error("Not a valid file object:", file);
          }
        });
      } else {
        console.log("No business licenses selected.");
      }
      // Append each entry to FormData
      Object.entries(completeData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Log FormData contents for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await fetch("/api/partnership/send-shop-request", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        sessionStorage.removeItem("partnershipData");
        document.cookie = "currentStep=5; path=/";
        router.push(routes.partnership5);
      }
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
        <div className="p-2 border-2 border-primary rounded-full"><Check /></div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-2 border-2 border-primary rounded-full"><Check /></div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-1 border-2 border-primary rounded-full"><div className="p-3.5 bg-primary rounded-full"></div></div>
      </div>
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 p-5">
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <LabelAndInput label="Username" name="username" placeholder="Enter your username" formik={formik} />
          <LabelAndInput label="Password" name="password" placeholder="Enter your password" formik={formik} type="password" />

          <Button type="submit" className="w-full mt-4">Submit</Button>
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}

// Helper Component for Input Fields
function LabelAndInput({ label, name, placeholder, formik, type = "text" }) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...formik.getFieldProps(name)}
        className={formik.errors[name] && formik.touched[name] ? "border-red-500" : ""}
      />
      {formik.errors[name] && formik.touched[name] && (
        <p className="text-sm text-red-500">{formik.errors[name]}</p>
      )}
    </div>
  );
}
