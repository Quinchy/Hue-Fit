// File: components/Login.jsx
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
import {
  ErrorMessage,
  InputErrorMessage,
  InputErrorStyle,
} from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { loginSchema } from "@/utils/validation-schema";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      const result = await signIn("credentials", {
        redirect: false,
        username: values.username,
        password: values.password,
      });

      if (result.ok) {
        try {
          const response = await fetch("/api/auth/session");
          const session = await response.json();
          if (session.user) {
            if (
              session.user.role === "VENDOR" &&
              session.user.status === "PENDING"
            ) {
              await router.push(routes.shopSetup);
            } else if (["ADMIN", "VENDOR"].includes(session.user.role)) {
              await router.push(routes.dashboard);
            } else {
              await router.push(routes.home);
            }
          }
        } catch (error) {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      } else {
        setErrorMessage(
          result.error || "Invalid credentials. Please try again."
        );
      }

      setLoading(false);
    },
  });

  return (
    <Card className="mt-40 w-[650px] p-5 flex flex-col gap-7">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-4xl">Login to Dashboard</CardTitle>
        <CardDescription className="text-center">
          Enter your username and password to access Hue-Fit Dashboard. <br />{" "}
          {"Don't have a vendor account?"}{" "}
          <Link
            href={routes.partnership}
            className="font-medium hover:underline"
          >
            Create here.
          </Link>
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
            <div className="flex flex-col items-end">
              <div className="flex flex-col space-y-1.5 w-full">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
              <Link
                className={`${buttonVariants({
                  variant: "link",
                })} font-light tracking-wide`}
                href={routes.forgotPassword}
              >
                <p>Forgot Password?</p>
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 transition-transform active:scale-[0.99]"
            disabled={loading}
          >
            {loading ? <LoadingMessage message="Logging in ..." /> : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-5">
        <ErrorMessage message={errorMessage} />
      </CardFooter>
    </Card>
  );
}
