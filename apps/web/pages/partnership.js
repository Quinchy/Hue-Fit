import { Card, CardTitle } from "@/components/ui/card";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import MapPicker from "@/components/ui/map-picker";
import Footer from "@/components/ui/footer";
import { useFormik } from "formik";
import { LoadingMessage } from "@/components/ui/loading-message";
import { SuccessMessage } from "@/components/ui/success-message"; 
import { partnershipRequestSchema } from "@/utils/validation-schema";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import { useState } from "react";

export default function Partnership() {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false); // Define loading state
  const [successMessage, setSuccessMessage] = useState("");

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
    validationSchema: partnershipRequestSchema,
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      setSuccessMessage(""); // Clear previous success message
      const formData = new FormData();
      formData.append("contactPerson[firstName]", values.firstName);
      formData.append("contactPerson[lastName]", values.lastName);
      formData.append("contactPerson[contactNumber]", values.contactNo);
      formData.append("contactPerson[email]", values.email);
      formData.append("contactPerson[position]", values.position);
      formData.append("shop[businessLicense]", values.businessLicense); // File directly
      formData.append("shop[shopName]", values.shopName);
      formData.append("shop[shopContactNumber]", values.shopContactNo);
      formData.append("shop[buildingNumber]", values.buildingNo);
      formData.append("shop[street]", values.street);
      formData.append("shop[barangay]", values.barangay);
      formData.append("shop[municipality]", values.municipality);
      formData.append("shop[province]", values.province);
      formData.append("shop[postalNumber]", values.postalNumber);
      formData.append("shop[googleMapPlaceName]", values.googleMapPlaceName || "None");
      formData.append("shop[latitude]", values.latitude || "");
      formData.append("shop[longitude]", values.longitude || "");

      const response = await fetch("/api/partnership/send-shop-request", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Partnership request submitted successfully!"); // Set success message
      } else {
        setSuccessMessage(""); // Clear success message if there’s an error
      }
      setLoading(false); // End loading
    },
  });

  return (
    <WebsiteLayoutWrapper>
      <div className="flex flex-col items-center gap-3">
        <CardTitle className="text-8xl text-center font-black"> Innovate Through <br></br> AI-OUTFIT Generation </CardTitle>
        <CardTitle className="text-2xl text-primary/80 font-base">{"Join us in revolutionizing men's fashion, one recommendation at a time."}</CardTitle>
      </div>
      <Card className="mb-40 mx-96">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <CardTitle className="text-2xl">Contact Person Informaton</CardTitle>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  {...formik.getFieldProps("firstName")}
                  className={InputErrorStyle(formik.errors.firstName, formik.touched.firstName)}
                />
                <InputErrorMessage error={formik.errors.firstName} touched={formik.touched.firstName} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  {...formik.getFieldProps("lastName")}
                  className={InputErrorStyle(formik.errors.lastName, formik.touched.lastName)}
                />
                <InputErrorMessage error={formik.errors.lastName} touched={formik.touched.lastName} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="contactnumber">Contact Number</Label>
                <Input
                  id="contactNo"
                  placeholder="Enter your contact number"
                  {...formik.getFieldProps("contactNo")}
                  className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
                />
                <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...formik.getFieldProps("email")}
                  className={InputErrorStyle(formik.errors.email, formik.touched.email)}
                />
                <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Enter your position"
                  {...formik.getFieldProps("position")}
                  className={InputErrorStyle(formik.errors.position, formik.touched.position)}
                />
                <InputErrorMessage error={formik.errors.position} touched={formik.touched.position} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="businesslocation">Business License</Label>
                <FileUpload
                  onFileSelect={(file) => formik.setFieldValue("businessLicense", file)}
                  maxSizeMB={20}
                />
                <InputErrorMessage error={formik.errors.businessLicense} touched={formik.touched.businessLicense} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <CardTitle className="text-2xl">Shop Informaton</CardTitle>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="shopname">Shop Name</Label>
                    <Input
                      id="shopName"
                      placeholder="Enter the shop name"
                      {...formik.getFieldProps("shopName")}
                      className={InputErrorStyle(formik.errors.shopName, formik.touched.shopName)}
                    />
                    <InputErrorMessage error={formik.errors.shopName} touched={formik.touched.shopName} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="shopcontactnumber">Shop Contact Number</Label>
                    <Input
                      id="shopContactNo"
                      placeholder="Enter the shop contact number"
                      {...formik.getFieldProps("shopContactNo")}
                      className={InputErrorStyle(formik.errors.shopContactNo, formik.touched.shopContactNo)}
                    />
                    <InputErrorMessage error={formik.errors.shopContactNo} touched={formik.touched.shopContactNo} />
                  </div>
                </div>
                <div className="flex flex-row w-full gap-5">
                  <div className="flex flex-col w-full gap-5">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="buildingnumber">Building Number</Label>
                      <Input
                        id="buildingNo"
                        placeholder="Enter the building number"
                        {...formik.getFieldProps("buildingNo")}
                        className={InputErrorStyle(formik.errors.buildingNo, formik.touched.buildingNo)}
                      />
                      <InputErrorMessage error={formik.errors.buildingNo} touched={formik.touched.buildingNo} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="barangay">Barangay</Label>
                      <Input
                        id="barangay"
                        placeholder="Enter the barangay"
                        {...formik.getFieldProps("barangay")}
                        className={InputErrorStyle(formik.errors.barangay, formik.touched.barangay)}
                      />
                      <InputErrorMessage error={formik.errors.barangay} touched={formik.touched.barangay} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="municipality">Municipality</Label>
                      <Input
                        id="municipality"
                        placeholder="Enter the municipality"
                        {...formik.getFieldProps("municipality")}
                        className={InputErrorStyle(formik.errors.municipality, formik.touched.municipality)}
                      />
                      <InputErrorMessage error={formik.errors.municipality} touched={formik.touched.municipality} />
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-5">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        placeholder="Enter the street"
                        {...formik.getFieldProps("street")}
                        className={InputErrorStyle(formik.errors.street, formik.touched.street)}
                      />
                      <InputErrorMessage error={formik.errors.street} touched={formik.touched.street} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="postalnumber">Postal Number</Label>
                      <Input
                        id="postalNumber"
                        placeholder="Enter the postal number"
                        {...formik.getFieldProps("postalNumber")}
                        className={InputErrorStyle(formik.errors.postalNumber, formik.touched.postalNumber)}
                      />
                      <InputErrorMessage error={formik.errors.postalNumber} touched={formik.touched.postalNumber} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="province">Province</Label>
                      <Input
                        id="province"
                        placeholder="Enter the province"
                        {...formik.getFieldProps("province")}
                        className={InputErrorStyle(formik.errors.province, formik.touched.province)}
                      />
                      <InputErrorMessage error={formik.errors.province} touched={formik.touched.province} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="location">Map Location</Label>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  center={location || { lat: 14.5995, lng: 120.9842 }} // Default to Manila
                />
                {location && (
                  <p className="text-center">
                    Selected Location: {locationName} ({location.lat}, {location.lng})
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? <LoadingMessage message="Submitting ..." /> : "Submit"}
          </Button>
          <SuccessMessage message={successMessage} className="mt-4 text-center" />
        </form>
      </Card>
      <Footer/>
    </WebsiteLayoutWrapper>
  );
}