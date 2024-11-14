// components/AddShop.js
import { useState } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import MapPicker from "@/components/ui/map-picker";
import { useFormik } from "formik";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { Plus } from "lucide-react";
import Image from "next/image";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/router";
import routes from "@/routes";

export default function AddShop() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const router = useRouter();

  const handleLocationSelect = (coords, placeName) => {
    setLocation(coords);
    setLocationName(placeName);
    formik.setFieldValue("latitude", coords.lat);
    formik.setFieldValue("longitude", coords.lng);
    formik.setFieldValue("googleMapPlaceName", placeName || "None");
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      contactNo: "",
      email: "",
      position: "",
      businessLicense: null,
      shopName: "",
      shopContactNo: "",
      buildingNo: "",
      street: "",
      barangay: "",
      municipality: "",
      province: "",
      postalNumber: "",
      googleMapPlaceName: "",
      longitude: null,
      latitude: null,
    },
    onSubmit: (values) => {
      // Submission logic
      console.log(values);
    },
  });

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className="flex flex-row justify-between">
          <CardTitle className="text-4xl font-bold">Add Shop</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.shop)}>
            <MoveLeft className="scale-125" />
            Back to Shops
          </Button>
        </div>

        <div className="flex flex-row items-start gap-5">
          <div className="flex flex-col items-center gap-5">
            <div className="bg-accent rounded border-8 border-card">
              <Image src="/images/placeholder-picture.png" alt="Profile" width={320} height={320} className="max-w-[30rem]" />
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="scale-110 stroke-[3px] mr-2" />
              Add Picture
            </Button>
          </div>
          <Card className="w-full">
            <div className="flex flex-col gap-5">
              {/* Shop Information */}
              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Shop Information</CardTitle>
                  <div className="flex flex-col gap-3">
                    <Label>Shop Name</Label>
                    <Input
                      placeholder="Enter the shop name"
                      {...formik.getFieldProps("shopName")}
                      className={InputErrorStyle(formik.errors.shopName, formik.touched.shopName)}
                    />
                    <InputErrorMessage error={formik.errors.shopName} touched={formik.touched.shopName} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Shop Contact Number</Label>
                    <Input
                      placeholder="Enter the shop contact number"
                      {...formik.getFieldProps("shopContactNo")}
                      className={InputErrorStyle(formik.errors.shopContactNo, formik.touched.shopContactNo)}
                    />
                    <InputErrorMessage error={formik.errors.shopContactNo} touched={formik.touched.shopContactNo} />
                  </div>
                </div>

                {/* Contact Person Information */}
                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Contact Person Information</CardTitle>
                  <div className="flex flex-col gap-3">
                    <Label>First Name</Label>
                    <Input
                      placeholder="Enter the first name"
                      {...formik.getFieldProps("firstName")}
                      className={InputErrorStyle(formik.errors.firstName, formik.touched.firstName)}
                    />
                    <InputErrorMessage error={formik.errors.firstName} touched={formik.touched.firstName} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Last Name</Label>
                    <Input
                      placeholder="Enter the last name"
                      {...formik.getFieldProps("lastName")}
                      className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
                    />
                    <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Contact Number</Label>
                    <Input
                      placeholder="Enter the contact number"
                      {...formik.getFieldProps("contactNo")}
                      className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
                    />
                    <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Email</Label>
                    <Input
                      placeholder="Enter the email"
                      {...formik.getFieldProps("email")}
                      className={InputErrorStyle(formik.errors.email, formik.touched.email)}
                    />
                    <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Position</Label>
                    <Input
                      placeholder="Enter the position"
                      {...formik.getFieldProps("position")}
                      className={InputErrorStyle(formik.errors.position, formik.touched.position)}
                    />
                    <InputErrorMessage error={formik.errors.position} touched={formik.touched.position} />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Description</Label>
                <Input variant="textarea" placeholder="Enter shop description" />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="font-bold">Business License</Label>
                <FileUpload
                  onFileSelect={(file) => formik.setFieldValue("businessLicense", file)}
                  maxSizeMB={20}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Shop Address Information and Map */}
        <Card className="w-full">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-3 w-full">
              <CardTitle className="text-2xl">Shop Address Information</CardTitle>
              <div className="flex flex-col gap-3">
                <Label>Building Number</Label>
                <Input
                  placeholder="Enter the building number"
                  {...formik.getFieldProps("buildingNo")}
                  className={InputErrorStyle(formik.errors.buildingNo, formik.touched.buildingNo)}
                />
                <InputErrorMessage error={formik.errors.buildingNo} touched={formik.touched.buildingNo} />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Street</Label>
                <Input
                  placeholder="Enter the street"
                  {...formik.getFieldProps("street")}
                  className={InputErrorStyle(formik.errors.street, formik.touched.street)}
                />
                <InputErrorMessage error={formik.errors.street} touched={formik.touched.street} />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Barangay</Label>
                <Input
                  placeholder="Enter the barangay"
                  {...formik.getFieldProps("barangay")}
                  className={InputErrorStyle(formik.errors.barangay, formik.touched.barangay)}
                />
                <InputErrorMessage error={formik.errors.barangay} touched={formik.touched.barangay} />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Municipality</Label>
                <Input
                  placeholder="Enter the municipality"
                  {...formik.getFieldProps("municipality")}
                  className={InputErrorStyle(formik.errors.municipality, formik.touched.municipality)}
                />
                <InputErrorMessage error={formik.errors.municipality} touched={formik.touched.municipality} />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Province</Label>
                <Input
                  placeholder="Enter the province"
                  {...formik.getFieldProps("province")}
                  className={InputErrorStyle(formik.errors.province, formik.touched.province)}
                />
                <InputErrorMessage error={formik.errors.province} touched={formik.touched.province} />
              </div>
              <div className="flex flex-col gap-3">
                <Label>Postal Number</Label>
                <Input
                  placeholder="Enter the postal number"
                  {...formik.getFieldProps("postalNumber")}
                  className={InputErrorStyle(formik.errors.postalNumber, formik.touched.postalNumber)}
                />
                <InputErrorMessage error={formik.errors.postalNumber} touched={formik.touched.postalNumber} />
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <Label>Google Map Location</Label>
                <MapPicker onLocationSelect={handleLocationSelect} center={{ lat: 14.5995, lng: 120.9842 }} />
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button type="submit" className="mt-6 w-full mb-20">
          Create Shop
        </Button>
      </div>
    </DashboardLayoutWrapper>
  );
}
