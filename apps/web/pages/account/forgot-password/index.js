// components/ForgotPassword.jsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";

// Import PasswordInput to add show/hide functionality
import { PasswordInput } from "@/components/ui/password-input";

// Import Dialog components from shadcn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Schema for the initial form: both username and email are required
const forgotPasswordSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

// Schema for the reset password dialog: includes OTP and new password fields
const resetPasswordSchema = Yup.object().shape({
  otp: Yup.string().required("OTP is required"),
  newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm Password is required"),
});

export default function ForgotPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetErrorMessage, setResetErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  // Save the username and email for use during password reset
  const [usernameForReset, setUsernameForReset] = useState("");
  const [emailForReset, setEmailForReset] = useState("");

  // Formik for sending the reset OTP
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      try {
        const response = await fetch("/api/forgot-password/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: values.username, email: values.email }),
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMessage("A password reset OTP has been sent to your email address.");
          setUsernameForReset(values.username);
          setEmailForReset(values.email);
          setDialogOpen(true); // Open the reset password dialog
        } else {
          setErrorMessage(data.error || "Failed to send reset OTP.");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    },
  });

  // Formik for the reset password dialog
  const resetFormik = useFormik({
    initialValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      setResetLoading(true);
      setResetErrorMessage("");
      try {
        const response = await fetch("/api/forgot-password/create-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: usernameForReset,
            email: emailForReset,
            otp: values.otp,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Password update successful; redirect to login page.
          setDialogOpen(false);
          router.push("/account/login");
        } else {
          setResetErrorMessage(data.error || "Failed to update password.");
        }
      } catch (error) {
        setResetErrorMessage("An unexpected error occurred. Please try again.");
      }
      setResetLoading(false);
    },
  });

  return (
    <>
      <Card className="mt-40 w-[650px] flex flex-col gap-7">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-4xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your username and email address to receive a password reset OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(formik.errors.username, formik.touched.username)}
                />
                <InputErrorMessage error={formik.errors.username} touched={formik.touched.username} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(formik.errors.email, formik.touched.email)}
                />
                <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? <LoadingMessage message="Sending reset OTP ..." /> : "Send Reset OTP"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-5">
          {errorMessage && <ErrorMessage message={errorMessage} className="mt-2" />}
          {successMessage && <div className="text-green-500 text-center">{successMessage}</div>}
        </CardFooter>
      </Card>
      
      {/* Dialog for resetting the password */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter the OTP sent to your email along with your new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetFormik.handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter OTP"
                  value={resetFormik.values.otp}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  className={InputErrorStyle(resetFormik.errors.otp, resetFormik.touched.otp)}
                />
                <InputErrorMessage error={resetFormik.errors.otp} touched={resetFormik.touched.otp} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <PasswordInput
                  id="newPassword"
                  placeholder="Enter new password"
                  value={resetFormik.values.newPassword}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  className={InputErrorStyle(resetFormik.errors.newPassword, resetFormik.touched.newPassword)}
                />
                <InputErrorMessage error={resetFormik.errors.newPassword} touched={resetFormik.touched.newPassword} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={resetFormik.values.confirmPassword}
                  onChange={resetFormik.handleChange}
                  onBlur={resetFormik.handleBlur}
                  className={InputErrorStyle(resetFormik.errors.confirmPassword, resetFormik.touched.confirmPassword)}
                />
                <InputErrorMessage error={resetFormik.errors.confirmPassword} touched={resetFormik.touched.confirmPassword} />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={resetLoading} className="w-full">
                {resetLoading ? <LoadingMessage message="Updating password ..." /> : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
          {resetErrorMessage && <ErrorMessage message={resetErrorMessage} className="mt-2 w-full text-center" />}
          <DialogClose asChild>
            <Button variant="outline" className="mt-2 w-full">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
