import { useState } from "react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useFormik } from "formik";
import routes from "@/routes";
import { buttonVariants } from "@/components/ui/button";
import { ErrorMessage, InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { loginSchema } from "@/utils/validation-schema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Track loading state
  const [errorMessage, setErrorMessage] = useState(""); // Track error message

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      setErrorMessage(""); // Clear any previous error message
      const result = await signIn("credentials", {
        redirect: false,
        username: values.username,
        password: values.password,
      });

      if (result.ok) {
        try {
          const response = await fetch("/api/auth/session");
          const session = await response.json();

          // Redirect based on the user's role
          if (session.user && session.user.role === "ADMIN" || session.user.role === "VENDOR") {
            await router.push(routes.dashboard);
          } 
          else {
            await router.push(routes.home);
          }
        } 
        catch (error) {
          setErrorMessage("An unexpected error occurred. Please try again."); // Handle other errors
        }
      } 
      else {
        // Display the error message from NextAuth
        setErrorMessage(result.error || "Invalid credentials. Please try again.");
      }

      setLoading(false); // End loading
    },
  });
  
  return (
    <Card className="mt-40 rounded-se-none rounded-es-none w-[650px] flex flex-col gap-7">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-4xl">Login to Hue-Fit Vendor</CardTitle>
        <CardDescription>
          Enter your username and password to access Hue-Fit Dashboard.
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
            <div className="flex flex-col items-end">
              <div className="flex flex-col space-y-1.5 w-full">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={InputErrorStyle(formik.errors.password, formik.touched.password)}
                />
                <InputErrorMessage error={formik.errors.password} touched={formik.touched.password} />
              </div>
              <Link
                className={`${buttonVariants({ variant: "link" })} font-light tracking-wide`}
                href={routes.forgotPassword1}
              >
                <p>Forgot Password?</p>
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-4"
            disabled={loading} // Disable button when loading
          >
            {loading ? <LoadingMessage message="Logging in ..." /> : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-5">
        <ErrorMessage message={errorMessage} className="mt-2" />
      </CardFooter>
    </Card>
  );
}