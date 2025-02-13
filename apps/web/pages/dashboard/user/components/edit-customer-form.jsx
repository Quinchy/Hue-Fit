// File: components/edit-customer-form.js
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";
import { Asterisk } from "lucide-react";

export default function EditCustomerForm({ form = {}, onChange }) {
  const initialAddress =
    form.addresses && form.addresses.length > 0
      ? form.addresses[0]
      : {
          buildingNo: "",
          street: "",
          barangay: "",
          municipality: "",
          province: "",
          postalCode: "",
        };

  const initialFeatures =
    form.features && form.features.length > 0
      ? form.features[0]
      : {
          height: "",
          weight: "",
          age: "",
          skintone: "",
          bodyShape: "",
        };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    username: Yup.string().required("Required"),
    address: Yup.object().shape({
      buildingNo: Yup.string(),
      street: Yup.string(),
      barangay: Yup.string().required("Required"),
      municipality: Yup.string().required("Required"),
      province: Yup.string().required("Required"),
      postalCode: Yup.string().required("Required"),
    }),
    features: Yup.object().shape({
      height: Yup.string().required("Required"),
      weight: Yup.string().required("Required"),
      age: Yup.string().required("Required"),
      skintone: Yup.string().required("Required"),
      bodyShape: Yup.string().required("Required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: form.firstName || "",
      lastName: form.lastName || "",
      email: form.email || "",
      username: form.username || "",
      address: {
        buildingNo: initialAddress.buildingNo || "",
        street: initialAddress.street || "",
        barangay: initialAddress.barangay || "",
        municipality: initialAddress.municipality || "",
        province: initialAddress.province || "",
        postalCode: initialAddress.postalCode || "",
      },
      features: {
        height: initialFeatures.height || "",
        weight: initialFeatures.weight || "",
        age: initialFeatures.age || "",
        skintone: initialFeatures.skintone || "",
        bodyShape: initialFeatures.bodyShape || "",
      },
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          username: values.username,
          addresses: [values.address],
          features: [values.features],
        };
        if (onChange) onChange(payload);
      } catch (error) {
        console.error("Submission error:", error);
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  // Propagate changes to parent on every value change
  useEffect(() => {
    const payload = {
      firstName: formik.values.firstName,
      lastName: formik.values.lastName,
      email: formik.values.email,
      username: formik.values.username,
      addresses: [formik.values.address],
      features: [formik.values.features],
    };
    if (onChange) onChange(payload);
  }, [formik.values, onChange]);

  return (
    <Card className="p-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <CardTitle className="text-2xl mb-4 font-semibold">
          Customer Information
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold flex items-center">
              First Name <Asterisk className="w-4" />
            </Label>
            <Input
              name="firstName"
              placeholder="Enter the customer's first name"
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
              placeholder="Enter the customer's last name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
            )}
          </div>
          <div className="col-span-2">
            <Label className="font-semibold flex items-center">
              Email <Asterisk className="w-4" />
            </Label>
            <Input
              name="email"
              type="email"
              placeholder="Enter the customer's email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.email, formik.touched.email)}
            />
            {formik.touched.email && formik.errors.email && (
              <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
            )}
          </div>
        </div>

        <CardTitle className="text-2xl my-4 font-semibold">
          Address
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Building No</Label>
            <Input
              name="address.buildingNo"
              placeholder="Enter building number"
              value={formik.values.address.buildingNo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.buildingNo, formik.touched.address?.buildingNo)}
            />
            {formik.touched.address?.buildingNo && formik.errors.address?.buildingNo && (
              <InputErrorMessage error={formik.errors.address.buildingNo} touched={formik.touched.address.buildingNo} />
            )}
          </div>
          <div>
            <Label className="font-semibold">Street</Label>
            <Input
              name="address.street"
              placeholder="Enter street"
              value={formik.values.address.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.street, formik.touched.address?.street)}
            />
            {formik.touched.address?.street && formik.errors.address?.street && (
              <InputErrorMessage error={formik.errors.address.street} touched={formik.touched.address.street} />
            )}
          </div>
          <div>
            <Label className="font-semibold flex items-center">
              Barangay <Asterisk className="w-4" />
            </Label>
            <Input
              name="address.barangay"
              placeholder="Enter barangay"
              value={formik.values.address.barangay}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.barangay, formik.touched.address?.barangay)}
            />
            {formik.touched.address?.barangay && formik.errors.address?.barangay && (
              <InputErrorMessage error={formik.errors.address.barangay} touched={formik.touched.address.barangay} />
            )}
          </div>
          <div>
            <Label className="font-semibold flex items-center">
              Municipality <Asterisk className="w-4" />
            </Label>
            <Input
              name="address.municipality"
              placeholder="Enter municipality"
              value={formik.values.address.municipality}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.municipality, formik.touched.address?.municipality)}
            />
            {formik.touched.address?.municipality && formik.errors.address?.municipality && (
              <InputErrorMessage error={formik.errors.address.municipality} touched={formik.touched.address.municipality} />
            )}
          </div>
          <div>
            <Label className="font-semibold flex items-center">
              Province <Asterisk className="w-4" />
            </Label>
            <Input
              name="address.province"
              placeholder="Enter province"
              value={formik.values.address.province}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.province, formik.touched.address?.province)}
            />
            {formik.touched.address?.province && formik.errors.address?.province && (
              <InputErrorMessage error={formik.errors.address.province} touched={formik.touched.address.province} />
            )}
          </div>
          <div>
            <Label className="font-semibold flex items-center">
              Postal Code <Asterisk className="w-4" />
            </Label>
            <Input
              name="address.postalCode"
              placeholder="Enter postal code"
              value={formik.values.address.postalCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.address?.postalCode, formik.touched.address?.postalCode)}
            />
            {formik.touched.address?.postalCode && formik.errors.address?.postalCode && (
              <InputErrorMessage error={formik.errors.address.postalCode} touched={formik.touched.address.postalCode} />
            )}
          </div>
        </div>

        <CardTitle className="text-2xl my-4 font-semibold">
          Account Information
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold flex items-center">
              Username <Asterisk className="w-4" />
            </Label>
            <Input
              name="username"
              placeholder="Create the customer's username"
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
      </form>
    </Card>
  );
}
