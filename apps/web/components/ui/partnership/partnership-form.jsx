// components/PartnershipForm.jsx
import Link from "next/link";
import Image from "next/image";
import routes from "@/routes";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useRef, useState, useEffect } from "react";
import { contactInfoSchema } from "@/utils/validation-schema";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputErrorMessage,
  InputErrorStyle,
  ErrorMessage,
} from "@/components/ui/error-message";
import { Asterisk, Phone, Mail, Loader } from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added shadcn select

export default function PartnershipForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [userOtp, setUserOtp] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Default form values
  const defaultValues = {
    firstName: "",
    lastName: "",
    contactNo: "",
    email: "",
    position: "",
    username: "",
    password: "",
    confirmPassword: "",
  };

  // Retrieve stored form data if available
  let storedFormData = {};
  if (typeof window !== "undefined") {
    const savedData = localStorage.getItem("partnershipFormData");
    if (savedData) {
      storedFormData = JSON.parse(savedData);
    }
  }
  const initialFormValues = { ...defaultValues, ...storedFormData };

  const fieldRefs = {
    firstName: useRef(null),
    lastName: useRef(null),
    position: useRef(null),
    contactNo: useRef(null),
    email: useRef(null),
    username: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
  };

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

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.post("/api/partnership/check-username", {
        username,
      });
      return response.data.available;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const sendOtp = async (email) => {
    try {
      const otpResponse = await axios.post("/api/partnership/send-otp", {
        email,
      });
      return otpResponse.data.success;
    } catch (error) {
      console.error("Error sending OTP:", error);
      return false;
    }
  };

  const handleOtpSubmit = async () => {
    setOtpLoading(true);
    try {
      const verifyResponse = await axios.post("/api/partnership/verify-otp", {
        email: formik.values.email,
        otp: userOtp,
      });

      if (!verifyResponse.data.success) {
        setOtpError("Invalid OTP. Please try again.");
        setOtpLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      for (const key in formik.values) {
        formDataToSend.append(key, formik.values[key]);
      }

      const createResponse = await axios.post(
        "/api/partnership/create-vendor-account",
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!createResponse.data.success) {
        setOtpError("Failed to create vendor account. Please try again.");
        setOtpLoading(false);
        return;
      }

      // Clear cached form data and set last submission timestamp for cooldown
      if (typeof window !== "undefined") {
        localStorage.removeItem("partnershipFormData");
        localStorage.setItem(
          "partnershipFormLastSubmission",
          Date.now().toString()
        );
      }
      router.push(routes.login);
    } catch (error) {
      console.error("Error processing OTP submission:", error);
      setOtpError(
        "An error occurred during account creation. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: contactInfoSchema,
    onSubmit: async (values) => {
      // Check for cooldown period
      if (cooldownRemaining > 0) {
        setUsernameError(
          `Please wait for ${Math.ceil(
            cooldownRemaining / 1000
          )} seconds before submitting again.`
        );
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(true);

      const isAvailable = await checkUsernameAvailability(values.username);
      if (!isAvailable) {
        setUsernameError("This username is already taken.");
        setIsSubmitting(false);
        return;
      }

      const otpSent = await sendOtp(values.email);
      if (!otpSent) {
        setOtpError("Failed to send OTP. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setOtpDialogOpen(true);
      setIsSubmitting(false);
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    formik.handleSubmit();
    if (Object.keys(formik.errors).length > 0) {
      scrollToFirstError();
    }
  };

  // Save form values to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "partnershipFormData",
        JSON.stringify(formik.values)
      );
    }
  }, [formik.values]);

  // Setup cooldown timer based on last submission timestamp
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastSubmission = localStorage.getItem(
        "partnershipFormLastSubmission"
      );
      if (lastSubmission) {
        const cooldown = 300000; // 5 minutes in milliseconds
        const elapsed = Date.now() - parseInt(lastSubmission, 10);
        if (elapsed < cooldown) {
          setCooldownRemaining(cooldown - elapsed);
          const interval = setInterval(() => {
            const newElapsed = Date.now() - parseInt(lastSubmission, 10);
            const newRemaining = cooldown - newElapsed;
            if (newRemaining <= 0) {
              setCooldownRemaining(0);
              clearInterval(interval);
            } else {
              setCooldownRemaining(newRemaining);
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      }
    }
  }, []);

  return (
    <>
      <div className="flex relative justify-center items-center">
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-20 w-full px-4 md:px-10 lg:px-44">
          {/* Left Column */}
          <div className="flex flex-col items-start gap-5 mt-5 w-full md:w-1/2">
            <CardTitle className="text-2xl text-start font-black tracking-wide">
              We empower vendors with a modern platform to redefine fashion
              retail and seamless e-commerce integration.
            </CardTitle>
            <div className="relative w-full">
              <Image
                src="/images/partnership.webp"
                alt="AI Outfit Generation"
                width={900}
                height={750}
                className="rounded-md object-cover w-full max-w-[75rem] max-h-[30rem]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent h-full"></div>
              <div className="absolute bottom-10 left-6 text-primary/75 text-2xl font-light">
                {"Join us in redefining men's fashion"}
                <br />
                {"with intelligent style solutions."}
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="flex flex-col items-center gap-10 w-full md:w-1/2">
            <Card className="w-full p-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-7 p-3">
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">
                    Your Personal Information
                  </CardTitle>
                  <div
                    className="flex flex-col gap-1"
                    ref={fieldRefs.firstName}
                  >
                    <Label
                      htmlFor="firstName"
                      className="font-bold flex flex-row items-center"
                    >
                      First Name
                      <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      autoComplete="on"
                      placeholder="Please enter your first name"
                      {...formik.getFieldProps("firstName")}
                      className={InputErrorStyle(
                        formik.errors.firstName,
                        formik.touched.firstName
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.firstName}
                      touched={formik.touched.firstName}
                    />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.lastName}>
                    <Label
                      htmlFor="lastName"
                      className="font-bold flex flex-row items-center"
                    >
                      Last Name
                      <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      autoComplete="on"
                      placeholder="Please enter your last name"
                      {...formik.getFieldProps("lastName")}
                      className={InputErrorStyle(
                        formik.errors.lastName,
                        formik.touched.lastName
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.lastName}
                      touched={formik.touched.lastName}
                    />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.position}>
                    <Label
                      htmlFor="position"
                      className="font-bold flex flex-row items-center"
                    >
                      Position
                      <Asterisk className="w-4" />
                    </Label>
                    {/* Replaced text input with shadcn Select */}
                    <Select
                      aria-labelledby="position"
                      onValueChange={(value) =>
                        formik.setFieldValue("position", value)
                      }
                      value={formik.values.position || ""}
                    >
                      <SelectTrigger
                        onBlur={() => formik.setFieldTouched("position", true)}
                        className={`w-full px-5 ${InputErrorStyle(
                          formik.errors.position,
                          formik.touched.position
                        )}`}
                      >
                        <SelectValue placeholder="Select your position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <InputErrorMessage
                      error={formik.errors.position}
                      touched={formik.touched.position}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">Contact Details</CardTitle>
                  <div
                    className="flex flex-col gap-1"
                    ref={fieldRefs.contactNo}
                  >
                    <Label
                      htmlFor="contactNo"
                      className="font-bold flex flex-row items-center"
                    >
                      Mobile Number
                      <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="contactNo"
                      name="contactNo"
                      type="text"
                      autoComplete="on"
                      placeholder="e.g. 09959185081"
                      variant="icon"
                      icon={Phone}
                      {...formik.getFieldProps("contactNo")}
                      className={InputErrorStyle(
                        formik.errors.contactNo,
                        formik.touched.contactNo
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.contactNo}
                      touched={formik.touched.contactNo}
                    />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.email}>
                    <Label
                      htmlFor="email"
                      className="font-bold flex flex-row items-center"
                    >
                      Email <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="on"
                      placeholder="e.g. john@gmail.com"
                      variant="icon"
                      icon={Mail}
                      {...formik.getFieldProps("email")}
                      className={InputErrorStyle(
                        formik.errors.email,
                        formik.touched.email
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.email}
                      touched={formik.touched.email}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">Account Details</CardTitle>
                  <div className="flex flex-col gap-1" ref={fieldRefs.username}>
                    <Label
                      htmlFor="username"
                      className="font-bold flex flex-row items-center"
                    >
                      Username
                      <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      autoComplete="on"
                      placeholder="Please enter a username"
                      {...formik.getFieldProps("username")}
                      className={InputErrorStyle(
                        formik.errors.username,
                        formik.touched.username
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.username}
                      touched={formik.touched.username}
                    />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.password}>
                    <Label
                      htmlFor="password"
                      className="font-bold flex flex-row items-center"
                    >
                      Password
                      <Asterisk className="w-4" />
                    </Label>
                    <PasswordInput
                      id="password"
                      name="password"
                      autoComplete="on"
                      placeholder="Please enter a password"
                      {...formik.getFieldProps("password")}
                      className={InputErrorStyle(
                        formik.errors.password,
                        formik.touched.password
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.password}
                      touched={formik.touched.password}
                    />
                  </div>
                  <div
                    className="flex flex-col gap-1"
                    ref={fieldRefs.confirmPassword}
                  >
                    <Label
                      htmlFor="confirmPassword"
                      className="font-bold flex flex-row items-center"
                    >
                      Confirm Password
                      <Asterisk className="w-4" />
                    </Label>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="on"
                      placeholder="Please re-enter the password"
                      {...formik.getFieldProps("confirmPassword")}
                      className={InputErrorStyle(
                        formik.errors.confirmPassword,
                        formik.touched.confirmPassword
                      )}
                    />
                    <InputErrorMessage
                      error={formik.errors.confirmPassword}
                      touched={formik.touched.confirmPassword}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
                    disabled={isSubmitting || cooldownRemaining > 0}
                    onClick={() => {
                      formik.setTouched({
                        firstName: true,
                        lastName: true,
                        position: true,
                        contactNo: true,
                        email: true,
                      });
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin w-5 h-5" />{" "}
                        Continuing...
                      </>
                    ) : cooldownRemaining > 0 ? (
                      `Please wait ${Math.ceil(
                        cooldownRemaining / 1000
                      )} seconds`
                    ) : (
                      "Continue"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-normal bg-card border-primary/75 transition-transform active:scale-[0.99]"
                    onClick={() => {
                      // Immediately reset form values to default and clear local storage
                      formik.resetForm({ values: defaultValues, touched: {} });
                      if (typeof window !== "undefined") {
                        localStorage.setItem(
                          "partnershipFormData",
                          JSON.stringify(defaultValues)
                        );
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Clear
                  </Button>
                </div>
                <p className="text-center text-primary/50 font-light text-sm">
                  By signing up for a Hue-Fit Vendor account you agree to our{" "}
                  <Link
                    href={routes.partnership}
                    className="text-primary px-[5px] hover:underline"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={routes.partnership}
                    className="text-primary px-[5px] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
                <div className="flex justify-center">
                  <ErrorMessage
                    message={usernameError}
                    condition={!!usernameError}
                  />
                  <ErrorMessage message={otpError} condition={!!otpError} />
                </div>
              </form>
            </Card>
          </div>
        </div>
        <div
          className="absolute inset-0 -z-10 w-full h-96 top-[50rem]"
          style={{
            background:
              "linear-gradient(to top, hsl(var(--pure)) 0%, transparent 100%)",
          }}
        ></div>
      </div>
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your email to proceed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={userOtp}
              onChange={(e) => setUserOtp(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleOtpSubmit}
              disabled={otpLoading}
              className="transition-transform active:scale-[0.99]"
            >
              {otpLoading ? (
                <>
                  <Loader className="animate-spin w-5 h-5" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
          <ErrorMessage message={otpError} condition={!!otpError} />
        </DialogContent>
      </Dialog>
    </>
  );
}
