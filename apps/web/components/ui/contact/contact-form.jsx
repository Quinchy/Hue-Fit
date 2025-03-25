"use client";

import { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Asterisk,
  CheckCircle2,
} from "lucide-react";
import { Gloock } from "next/font/google";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const gloock = Gloock({
  style: ["normal"],
  weight: ["400"],
  subsets: ["latin"],
});

// Use motion("a") for external links.
const MotionLink = motion("a");

const socialLinkClasses =
  "border-[1px] p-3 border-primary/50 rounded-full flex flex-col items-center justify-center transition-colors duration-300 hover:border-primary";

const subjectOptions = [
  { value: "VENDOR_SUSPENSION", label: "Vendor Account Suspension" },
  { value: "CUSTOMER_SUSPENSION", label: "Customer Account Suspension" },
  { value: "TECHNICAL_HELP", label: "Technical Assistance" },
  { value: "OTHERS", label: "Other" },
];

const inquirySchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  subjectOption: Yup.string().required("Subject is required"),
  customSubject: Yup.string().when("subjectOption", {
    is: (val) => val === "OTHERS",
    then: () => Yup.string().required("Please enter the title of your concern"),
    otherwise: () => Yup.string().nullable(),
  }),
  message: Yup.string().required("Message is required"),
});

export default function ContactForm() {
  // Alert state
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Create field references for scrolling to the first error.
  const fieldRefs = {
    email: useRef(null),
    subjectOption: useRef(null),
    customSubject: useRef(null),
    message: useRef(null),
  };

  // Function to scroll to the first error field.
  const scrollToFirstError = () => {
    const errorFields = Object.keys(formik.errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const fieldRef = fieldRefs[firstErrorField];
      if (fieldRef && fieldRef.current) {
        fieldRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      subjectOption: "",
      customSubject: "",
      message: "",
    },
    validationSchema: inquirySchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const subject =
        values.subjectOption === "OTHERS"
          ? values.customSubject
          : subjectOptions.find((opt) => opt.value === values.subjectOption)
              ?.label;
      const payload = {
        email: values.email,
        subject,
        message: values.message,
      };
      try {
        const res = await fetch("/api/contact/send-inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setSuccessMessage("Your inquiry has been submitted successfully!");
          setShowSuccessAlert(true);
          resetForm();
        } else {
          console.error("Error submitting inquiry");
        }
      } catch (error) {
        console.error("Submission error", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Custom handleSubmit that sets touched fields and scrolls to the first error.
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields as touched.
    formik.setTouched({
      email: true,
      subjectOption: true,
      customSubject: true,
      message: true,
    });
    await formik.handleSubmit();
    if (Object.keys(formik.errors).length > 0) {
      scrollToFirstError();
    }
  };

  return (
    <div className="flex flex-col gap-20 relative px-4 md:px-20 lg:px-[15rem]">
      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="fixed z-50 w-[90%] max-w-md right-4 bottom-4 flex items-center shadow-lg rounded-lg">
          <CheckCircle2 className="h-10 w-10 stroke-green-500" />
          <div className="ml-7">
            <AlertTitle className="text-green-400 text-base font-semibold">
              Inquiry Submitted
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
      <div className="flex flex-col gap-20">
        <h1
          className={`text-5xl md:text-6xl lg:text-7xl min-[1713px]:text-7xl text-primary font-black text-center 2xl:text-start cursor-pointer ${gloock.className}`}
        >
          QUESTIONS ON STYLE? ASK AWAY!
        </h1>
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <Card className="w-full p-2 md:w-[55%]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10 p-5">
              <div>
                <CardTitle className="text-3xl">Get In Touch</CardTitle>
                <p className="font-light text-primary/75">
                  {
                    "Have a question or need assistance? Reach out to us and we'll respond promptly!"
                  }
                </p>
              </div>
              <div className="flex flex-col gap-5">
                {/* Email Field */}
                <div className="flex flex-col gap-1" ref={fieldRefs.email}>
                  <Label
                    htmlFor="email"
                    className="font-bold flex flex-row items-center"
                  >
                    Email <Asterisk className="w-4" />
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    {...formik.getFieldProps("email")}
                    className={InputErrorStyle(
                      formik.errors.email,
                      formik.touched.email
                    )}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <InputErrorMessage
                      error={formik.errors.email}
                      touched={formik.touched.email}
                    />
                  )}
                </div>
                {/* Subject Field */}
                <div
                  className="flex flex-col gap-1"
                  ref={fieldRefs.subjectOption}
                >
                  <Label
                    htmlFor="subject"
                    className="font-bold flex flex-row items-center"
                  >
                    Subject <Asterisk className="w-4" />
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      formik.setFieldValue("subjectOption", value)
                    }
                    value={formik.values.subjectOption}
                  >
                    <SelectTrigger
                      className={`w-full ${InputErrorStyle(
                        formik.errors.subjectOption,
                        formik.touched.subjectOption
                      )}`}
                    >
                      <SelectValue placeholder="Select your concern" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.subjectOption &&
                    formik.errors.subjectOption && (
                      <InputErrorMessage
                        error={formik.errors.subjectOption}
                        touched={formik.touched.subjectOption}
                      />
                    )}
                  {formik.values.subjectOption === "OTHERS" && (
                    <div className="mt-2" ref={fieldRefs.customSubject}>
                      <Input
                        id="customSubject"
                        type="text"
                        placeholder="Enter title of your concern"
                        value={formik.values.customSubject}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={InputErrorStyle(
                          formik.errors.customSubject,
                          formik.touched.customSubject
                        )}
                      />
                      {formik.touched.customSubject &&
                        formik.errors.customSubject && (
                          <InputErrorMessage
                            error={formik.errors.customSubject}
                            touched={formik.touched.customSubject}
                          />
                        )}
                    </div>
                  )}
                </div>
                {/* Message Field */}
                <div className="flex flex-col gap-1" ref={fieldRefs.message}>
                  <Label
                    htmlFor="message"
                    className="font-bold flex flex-row items-center"
                  >
                    Message <Asterisk className="w-4" />
                  </Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Your Message"
                    {...formik.getFieldProps("message")}
                    className={InputErrorStyle(
                      formik.errors.message,
                      formik.touched.message
                    )}
                  />
                  {formik.touched.message && formik.errors.message && (
                    <InputErrorMessage
                      error={formik.errors.message}
                      touched={formik.touched.message}
                    />
                  )}
                </div>
              </div>
              <Button type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? (
                  <LoadingMessage message="Submitting..." />
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Card>
          <div className="w-full md:w-[45%] flex flex-col gap-10">
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="flex items-center gap-4">
                <MapPin width={30} height={30} className="stroke-1" />
                <CardTitle className="text-xl">
                  BONIFACIO GLOBAL CITY, TAGUIG
                </CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <Phone width={30} height={30} className="stroke-1" />
                <CardTitle className="text-xl">+63 917 123 4567</CardTitle>
              </div>
              <div className="flex items-center gap-4">
                <Mail width={30} height={30} className="stroke-1" />
                <CardTitle className="text-xl">inquiries@huefit.com</CardTitle>
              </div>
            </div>
            <div className="flex flex-row justify-center md:justify-start min-w-[15rem] gap-5">
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <Facebook className="stroke-1" />
              </MotionLink>
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <Twitter className="stroke-1" />
              </MotionLink>
              <MotionLink
                href=""
                className={socialLinkClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{
                  scale: 1.15,
                  transition: { type: "spring", stiffness: 300, damping: 10 },
                }}
              >
                <Instagram className="stroke-1" />
              </MotionLink>
            </div>
          </div>
        </div>
        <div className="h-20"></div>
      </div>
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--pure)) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
