import { useEffect, useContext, useState } from "react";
import { useFormik } from "formik";
import { accountInfoSchema } from "@/utils/validation-schema";
import { useRouter } from "next/router";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check, Asterisk } from "lucide-react";
import { FormContext } from "@/providers/form-provider";
import { LoadingMessage } from "@/components/ui/loading-message";
import { ErrorMessage } from "@/components/ui/error-message"; // Import ErrorMessage
import { InputErrorMessage } from "@/components/ui/error-message"; // Import InputErrorMessage

export default function AccountInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false); // Track loading state for saved data
  const [errorMessage, setErrorMessage] = useState(""); // Track error messages from API

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: accountInfoSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage(""); // Reset error message
      updateFormData(values);
      const completeData = { ...formData, ...values };
      const formDataToSend = new FormData();

      Object.entries(completeData).forEach(([key, value]) => {
        if (key !== "businessLicense") {
          formDataToSend.append(key, value);
        }
      });

      if (completeData.businessLicense && completeData.businessLicense.length > 0) {
        completeData.businessLicense.forEach((file, index) => {
          if (file instanceof File) {
            formDataToSend.append(`businessLicense[${index}]`, file, file.name);
          }
        });
      }

      try {
        const response = await fetch("/api/partnership/send-shop-request", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          document.cookie = "currentStep=5; path=/";
          router.push(routes.partnership5);
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "An error occurred");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("accountInfo"));
    if (savedData) {
      formik.setValues(savedData);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("accountInfo", JSON.stringify(formik.values));
    }
  }, [formik.values, loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      <div className="flex flex-row items-center">
        <div className="p-2 border-2 border-primary rounded-full">
          <Check />
        </div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-2 border-2 border-primary rounded-full">
          <Check />
        </div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-2 border-2 border-primary rounded-full">
          <Check />
        </div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-1 border-2 border-primary rounded-full">
          <div className="p-3.5 bg-primary rounded-full"></div>
        </div>
      </div>
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 p-5">
          <CardTitle className="text-2xl">Account Information</CardTitle>
          <LabelAndInput
            label="Username"
            name="username"
            placeholder="Enter your username"
            formik={formik}
          />
          <LabelAndInput
            label="Password"
            name="password"
            placeholder="Enter your password"
            formik={formik}
            type="password"
          />
          {errorMessage && (
            <ErrorMessage message={errorMessage} className="mt-2" />
          )}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? <LoadingMessage message="Submitting..." /> : "Submit"}
          </Button>
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}

function LabelAndInput({ label, name, placeholder, formik, type = "text" }) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name} className={`font-bold flex flex-row items-center`}>{label}<Asterisk className="w-4" /></Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...formik.getFieldProps(name)}
        className={
          formik.errors[name] && formik.touched[name] ? "border-red-500" : ""
        }
      />
      <InputErrorMessage error={formik.errors[name]} touched={formik.touched[name]} />
    </div>
  );
}
