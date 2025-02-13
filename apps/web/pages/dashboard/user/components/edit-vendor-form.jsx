// File: components/edit-vendor-form.js
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { Asterisk } from "lucide-react";

export default function EditVendorForm({ form = {}, onChange }) {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/shops/get-shops?limit=1000");
        if (!res.ok) throw new Error("Failed to fetch shops");
        const data = await res.json();
        setShops(data.shops);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const validationSchema = Yup.object().shape({
    shop: Yup.string().required("Required"),
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    contactNo: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    position: Yup.string().required("Required"),
    username: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      shop: form.shop || "",
      firstName: form.firstName || "",
      lastName: form.lastName || "",
      contactNo: form.contactNo || "",
      email: form.email || "",
      position: form.position || "",
      username: form.username || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (onChange) onChange(values);
      } catch (error) {
        console.error("Submission error", error);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Propagate changes to parent on every value change
  useEffect(() => {
    if (onChange) onChange(formik.values);
  }, [formik.values, onChange]);

  return (
    <Card className="flex flex-col p-5 gap-5 shadow-md w-full">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-semibold">Role Information</CardTitle>
          <div className="flex flex-col">
            <Label className="font-semibold flex items-center">
              Shop <Asterisk className="w-4" />
            </Label>
            <Select
              name="shop"
              value={formik.values.shop}
              onValueChange={(value) => formik.setFieldValue("shop", value)}
            >
              <SelectTrigger
                className={`w-[280px] p-2 mt-2 border rounded ${InputErrorStyle(
                  formik.errors.shop,
                  formik.touched.shop
                )}`}
              >
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {shops.map((shop) => (
                    <SelectItem key={shop.shopNo} value={shop.shopNo}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {formik.touched.shop && formik.errors.shop && (
              <InputErrorMessage error={formik.errors.shop} touched={formik.touched.shop} />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-semibold">Vendor Information</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold flex items-center">
                First Name <Asterisk className="w-4" />
              </Label>
              <Input
                name="firstName"
                placeholder="Enter the vendor's first name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.firstName, formik.touched.firstName)}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <InputErrorMessage error={formik.errors.firstName} touched={formik.touched.firstName} />
              )}
            </div>
            <div>
              <Label className="font-semibold flex items-center">
                Last Name <Asterisk className="w-4" />
              </Label>
              <Input
                name="lastName"
                placeholder="Enter the vendor's last name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
              )}
            </div>
            <div>
              <Label className="font-semibold flex items-center">
                Contact Number <Asterisk className="w-4" />
              </Label>
              <Input
                name="contactNo"
                placeholder="Enter the vendor's contact number"
                value={formik.values.contactNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
              />
              {formik.touched.contactNo && formik.errors.contactNo && (
                <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
              )}
            </div>
            <div>
              <Label className="font-semibold flex items-center">
                Email <Asterisk className="w-4" />
              </Label>
              <Input
                name="email"
                type="email"
                placeholder="Enter the vendor's email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.email, formik.touched.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
              )}
            </div>
            <div className="col-span-2">
              <Label className="font-semibold flex items-center">
                Position <Asterisk className="w-4" />
              </Label>
              <Input
                name="position"
                placeholder="Enter the vendor's position"
                value={formik.values.position}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.position, formik.touched.position)}
              />
              {formik.touched.position && formik.errors.position && (
                <InputErrorMessage error={formik.errors.position} touched={formik.touched.position} />
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold flex items-center">
                Username <Asterisk className="w-4" />
              </Label>
              <Input
                name="username"
                placeholder="Create the vendor's username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={InputErrorStyle(formik.errors.username, formik.touched.username)}
              />
              {formik.touched.username && formik.errors.username && (
                <InputErrorMessage error={formik.errors.username} touched={formik.touched.username} />
              )}
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
