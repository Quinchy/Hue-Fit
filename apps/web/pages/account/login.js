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
import { ErrorMessage, ErrorStyle } from "@/components/ui/error-messages";
import { loginSchema } from "@/utils/validation-schema";

export default function Login() {
  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);
    },
  });

  return (
    <Card className="mt-40 rounded-se-none rounded-es-none w-[650px] flex flex-col gap-7">
      <CardHeader className="flex flex-col items-center">
        <CardTitle className="text-4xl">Login to Hue-Fit</CardTitle>
        <CardDescription>Enter your username and password to access Hue-Fit Dashboard.</CardDescription>
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
                className={ErrorStyle(formik.touched.username, formik.errors.username)}
              />
              <ErrorMessage error={formik.errors.username} touched={formik.touched.username} />
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
                  className={ErrorStyle(formik.touched.password, formik.errors.password)}
                />
                <ErrorMessage error={formik.errors.password} touched={formik.touched.password} />
              </div>
              <Link
                className={`${buttonVariants({ variant: "link" })} font-light tracking-wide`}
                href={routes.forgotPassword1}
              >
                <p>Forgot Password?</p>
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" onClick={formik.handleSubmit} className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}