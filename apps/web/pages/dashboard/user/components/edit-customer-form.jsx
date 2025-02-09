import { useFormik } from "formik";
import * as Yup from "yup";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";

export default function EditCustomerForm({ form, onChange }) {
  // Prepare initial values for address and features.
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

  // Define validation schema.
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    username: Yup.string().required("Required"),
    address: Yup.object().shape({
      buildingNo: Yup.string().required("Required"),
      street: Yup.string().required("Required"),
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

  // Initialize Formik.
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
        // Simulate an API call delay.
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Convert nested address and features objects into arrays.
        const payload = {
          ...values,
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

  return (
    <Card className="p-6">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Customer Information Section */}
        <CardTitle className="text-2xl mb-4 font-semibold">
          Customer Information
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">First Name</Label>
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
            <Label className="font-semibold">Last Name</Label>
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
            <Label className="font-semibold">Email</Label>
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

        {/* Address Section */}
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
            <Label className="font-semibold">Barangay</Label>
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
            <Label className="font-semibold">Municipality</Label>
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
            <Label className="font-semibold">Province</Label>
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
            <Label className="font-semibold">Postal Code</Label>
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

        {/* Account Information Section */}
        <CardTitle className="text-2xl my-4 font-semibold">
          Account Information
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Username</Label>
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

        {/* Customer Features Section */}
        <CardTitle className="text-2xl my-4 font-semibold">
          Customer Features
        </CardTitle>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-semibold">Height</Label>
            <Input
              name="features.height"
              placeholder="Enter height"
              value={formik.values.features.height}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.features?.height, formik.touched.features?.height)}
            />
            {formik.touched.features?.height && formik.errors.features?.height && (
              <InputErrorMessage error={formik.errors.features.height} touched={formik.touched.features.height} />
            )}
          </div>
          <div>
            <Label className="font-semibold">Weight</Label>
            <Input
              name="features.weight"
              placeholder="Enter weight"
              value={formik.values.features.weight}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.features?.weight, formik.touched.features?.weight)}
            />
            {formik.touched.features?.weight && formik.errors.features?.weight && (
              <InputErrorMessage error={formik.errors.features.weight} touched={formik.touched.features.weight} />
            )}
          </div>
          <div>
            <Label className="font-semibold">Age</Label>
            <Input
              name="features.age"
              placeholder="Enter age"
              value={formik.values.features.age}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.features?.age, formik.touched.features?.age)}
            />
            {formik.touched.features?.age && formik.errors.features?.age && (
              <InputErrorMessage error={formik.errors.features.age} touched={formik.touched.features.age} />
            )}
          </div>
          <div>
            <Label className="font-semibold">Skintone</Label>
            <Input
              name="features.skintone"
              placeholder="Enter skintone"
              value={formik.values.features.skintone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.features?.skintone, formik.touched.features?.skintone)}
            />
            {formik.touched.features?.skintone && formik.errors.features?.skintone && (
              <InputErrorMessage error={formik.errors.features.skintone} touched={formik.touched.features.skintone} />
            )}
          </div>
          <div>
            <Label className="font-semibold">Body Shape</Label>
            <Input
              name="features.bodyShape"
              placeholder="Enter body shape"
              value={formik.values.features.bodyShape}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={InputErrorStyle(formik.errors.features?.bodyShape, formik.touched.features?.bodyShape)}
            />
            {formik.touched.features?.bodyShape && formik.errors.features?.bodyShape && (
              <InputErrorMessage error={formik.errors.features.bodyShape} touched={formik.touched.features.bodyShape} />
            )}
          </div>
        </div>

        <Button className="mt-6 w-full" type="submit" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Card>
  );
}
