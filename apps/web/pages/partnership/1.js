import Link from "next/link";
import Image from "next/image";
import routes from "@/routes";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useContext, useRef, useState } from "react";
import { contactInfoSchema } from "@/utils/validation-schema";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle, ErrorMessage } from "@/components/ui/error-message";
import { Asterisk, Phone, Mail, Loader } from "lucide-react";
import { FormContext } from "@/providers/form-provider";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ContactInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [userOtp, setUserOtp] = useState("");

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
        fieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.post("/api/partnership/check-username", { username });
      return response.data.available;
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const sendOtp = async (email) => {
    try {
      const otpResponse = await axios.post("/api/partnership/send-otp", { email });
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

      updateFormData(formik.values);
      document.cookie = "currentStep=2; path=/";
      router.push(routes.partnership2);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("An error occurred during OTP verification. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: formData?.firstName || "",
      lastName: formData?.lastName || "",
      contactNo: formData?.contactNo || "",
      email: formData?.email || "",
      position: formData?.position || "",
      username: formData?.username || "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: contactInfoSchema,
    onSubmit: async (values) => {
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

  return (
    <>
      <WebsiteLayoutWrapper className="justify-center items-center">
        <div className="flex flex-row items-start gap-20">
          <div className="flex flex-col items-start gap-5 mt-20">
            <CardTitle className="text-2xl text-start font-black tracking-wide">
              We empower vendors with a modern platform to redefine 
              <br />
              fashion retail and seamless e-commerce integration.
            </CardTitle>
            <div className="relative">
              <Image
                src="/images/partnership.webp" alt="AI Outfit Generation" width={900} height={750}
                className="rounded-md object-cover max-w-[75rem] max-h-[30rem]" priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent h-full"></div>
              <div className="absolute bottom-10 left-6 text-primary/75 text-2xl font-light">
                {"Join us in redefining men's fashion"}
                <br />
                {"with intelligent style solutions."}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-10">
            <Card className="w-full">
              <form onSubmit={handleSubmit} className="flex flex-col gap-7 p-3">
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">Your Personal Information</CardTitle>
                  <div className="flex flex-col gap-1" ref={fieldRefs.firstName}>
                    <Label htmlFor="firstName" className="font-bold flex flex-row items-center">
                      First Name<Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="firstName" name="firstName" autoComplete="on" placeholder="Please enter your first name"
                      {...formik.getFieldProps("firstName")} className={InputErrorStyle(formik.errors.firstName, formik.touched.firstName)}
                    />
                    <InputErrorMessage error={formik.errors.firstName} touched={formik.touched.firstName} />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.lastName}>
                    <Label htmlFor="lastName" className="font-bold flex flex-row items-center">
                      Last Name<Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="lastName" name="lastName" autoComplete="on" placeholder="Please enter your last name"
                      {...formik.getFieldProps("lastName")} className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
                    />
                    <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.position}>
                    <Label htmlFor="position" className="font-bold flex flex-row items-center">
                      Position<Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="position" name="position" autoComplete="on"
                      placeholder="Please enter your position within your store (e.g. Owner, Manager)"
                      {...formik.getFieldProps("position")}
                      className={InputErrorStyle(formik.errors.position, formik.touched.position)}
                    />
                    <InputErrorMessage error={formik.errors.position} touched={formik.touched.position} />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">Contact Details</CardTitle>
                  <div className="flex flex-col gap-1" ref={fieldRefs.contactNo}>
                    <Label htmlFor="contactNo" className="font-bold flex flex-row items-center">
                      Mobile Number<Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="contactNo" name="contactNo" type="text"
                      autoComplete="on" placeholder="e.g. 09959185081" variant="icon" icon={Phone}
                      {...formik.getFieldProps("contactNo")}
                      className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
                    />
                    <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.email}>
                    <Label htmlFor="email" className="font-bold flex flex-row items-center">
                      Email <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="email" name="email" type="email" autoComplete="on"
                      placeholder="e.g. john@gmail.com" variant="icon" icon={Mail}
                      {...formik.getFieldProps("email")} className={InputErrorStyle(formik.errors.email, formik.touched.email)}
                    />
                    <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-2xl">Account Details</CardTitle>
                  <div className="flex flex-col gap-1" ref={fieldRefs.username}>
                    <Label htmlFor="username" className="font-bold flex flex-row items-center">
                      Username<Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="username" name="username" autoComplete="on" placeholder="Please enter a username"
                      {...formik.getFieldProps("username")} className={InputErrorStyle(formik.errors.username, formik.touched.username)}
                    />
                    <InputErrorMessage error={formik.errors.username} touched={formik.touched.username} />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.password}>
                    <Label htmlFor="password" className="font-bold flex flex-row items-center">
                      Password<Asterisk className="w-4" />
                    </Label>
                    <PasswordInput
                      id="password" name="password" autoComplete="on" placeholder="Please enter a password"
                      {...formik.getFieldProps("password")} className={InputErrorStyle(formik.errors.password, formik.touched.password)}
                    />
                    <InputErrorMessage error={formik.errors.password} touched={formik.touched.password} />
                  </div>
                  <div className="flex flex-col gap-1" ref={fieldRefs.confirmPassword}>
                    <Label htmlFor="confirmPassword" className="font-bold flex flex-row items-center">
                      Confirm Password<Asterisk className="w-4" />
                    </Label>
                    <PasswordInput
                      id="confirmPassword" name="confirmPassword" autoComplete="on" placeholder="Please re-enter the password"
                      {...formik.getFieldProps("confirmPassword")}
                      className={InputErrorStyle(formik.errors.confirmPassword, formik.touched.confirmPassword)}
                    />
                    <InputErrorMessage error={formik.errors.confirmPassword} touched={formik.touched.confirmPassword} />
                  </div>
                </div>
                <Button
                  type="submit" className="w-full mt-4 flex items-center justify-center gap-2" disabled={isSubmitting}
                  onClick={() => {
                    formik.setTouched({ firstName: true, lastName: true, position: true, contactNo: true, email: true });
                  }}
                >
                  {isSubmitting && <Loader className="animate-spin w-5 h-5" />}
                  {isSubmitting ? "Continuing..." : "Continue"}
                </Button>
                <p className="text-center text-primary/50 font-light text-sm">
                  By signing up for a Hue-Fit Vendor account you agree to our  
                  <Link href={routes.partnership} className="text-primary px-[5px] hover:underline">Terms of Use</Link>
                  and 
                  <Link href={routes.partnership} className="text-primary px-[5px] hover:underline">Privacy Policy</Link>
                </p>
                <div className="flex justify-center">
                  <ErrorMessage message={usernameError} condition={!!usernameError} />
                  <ErrorMessage message={otpError} condition={!!otpError} />
                </div>
              </form>
            </Card>
          </div>
        </div>
      </WebsiteLayoutWrapper>

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
            <Button type="button" onClick={handleOtpSubmit} disabled={otpLoading}>
              {otpLoading ? <Loader className="animate-spin w-5 h-5" /> : "Submit"}
            </Button>
          </div>
          <ErrorMessage message={otpError} condition={!!otpError} />
        </DialogContent>
      </Dialog>
    </>
  );
}
