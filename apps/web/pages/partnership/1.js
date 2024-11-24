import { useFormik } from "formik";
import { contactInfoSchema } from "@/utils/validation-schema"; // Validation schema for Step 1
import { useRouter } from "next/router";
import routes from "@/routes"; // Using your defined routes
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { useContext, useEffect, useState } from "react";
import { Asterisk } from "lucide-react";
import { FormContext } from "@/providers/form-provider";

export default function ContactInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [loaded, setLoaded] = useState(false); // To ensure form is populated after data load

  // Formik setup with validation schema for Step 1
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      contactNo: "",
      email: "",
      position: "",
    },
    validationSchema: contactInfoSchema,
    onSubmit: (values) => {
      updateFormData(values);
      localStorage.setItem("contactInfo", JSON.stringify(values));
      document.cookie = "currentStep=2; path=/";
      router.push(routes.partnership2);
    },
  });

  // Load saved form data on component mount
  useEffect(() => {
    const savedFormData = JSON.parse(localStorage.getItem("contactInfo"));
    if (savedFormData) {
      formik.setValues(savedFormData);
    }
    setLoaded(true); // Ensure form renders after loading data
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("contactInfo", JSON.stringify(formik.values));
    }
  }, [formik.values, loaded]);

  if (!loaded) {
    // Avoid rendering form until data is loaded
    return null;
  }

  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      <div className="flex flex-col items-center gap-3">
        <CardTitle className="text-8xl text-center font-black">
          Innovate Through <br></br> AI-OUTFIT Generation
        </CardTitle>
        <CardTitle className="text-2xl text-primary/80 font-base">
          {"Join us in revolutionizing men's fashion, one recommendation at a time."}
        </CardTitle>
      </div>
      <div className="flex flex-row items-center">
        <div className="p-1 border-2 border-primary rounded-full">
          <div className="p-3.5 bg-primary rounded-full"></div>
        </div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
      </div>
      {/* Contact Information Form */}
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 p-5">
          <CardTitle className="text-2xl">Contact Person Information</CardTitle>
          <div className="flex flex-col gap-3">
            <Label htmlFor="firstName" className="font-bold flex flex-row items-center">
              First Name<Asterisk className="w-4" />
            </Label>
            <Input
              id="firstName"
              placeholder="Enter your first name"
              {...formik.getFieldProps("firstName")}
              className={InputErrorStyle(formik.errors.firstName, formik.touched.firstName)}
            />
            <InputErrorMessage error={formik.errors.firstName} touched={formik.touched.firstName} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="lastName" className="font-bold flex flex-row items-center">
              Last Name<Asterisk className="w-4" />
            </Label>
            <Input
              id="lastName"
              placeholder="Enter your last name"
              {...formik.getFieldProps("lastName")}
              className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
            />
            <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="contactNo" className="font-bold flex flex-row items-center">
              Contact Number<Asterisk className="w-4" />
            </Label>
            <Input
              id="contactNo"
              placeholder="Enter your contact number"
              {...formik.getFieldProps("contactNo")}
              className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
            />
            <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="email" className="font-bold flex flex-row items-center">
              Email<Asterisk className="w-4" />
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
              className={InputErrorStyle(formik.errors.email, formik.touched.email)}
            />
            <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="position" className="font-bold flex flex-row items-center">
              Position<Asterisk className="w-4" />
            </Label>
            <Input
              id="position"
              placeholder="Enter your position"
              {...formik.getFieldProps("position")}
              className={InputErrorStyle(formik.errors.position, formik.touched.position)}
            />
            <InputErrorMessage error={formik.errors.position} touched={formik.touched.position} />
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            onClick={() => {
              formik.setTouched({
                firstName: true,
                lastName: true,
                contactNo: true,
                email: true,
                position: true,
              });
            }}
          >
            Next
          </Button>
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}
