// Step 3 Component (Location Information)
// File: 3.js
import { useEffect } from "react";
import { useFormik } from "formik";
import { locationInfoSchema } from "@/utils/validation-schema";
import { useRouter } from "next/router";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import MapPicker from "@/components/ui/map-picker";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check } from 'lucide-react';

export default function LocationInformationStep() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: { googleMapPlaceName: "", latitude: null, longitude: null },
    validationSchema: locationInfoSchema,
    onSubmit: (values) => {
      console.log('Location Information:', values);
      const previousData = JSON.parse(sessionStorage.getItem("partnershipData")) || {};
      const completeData = { ...previousData, ...values };
      sessionStorage.setItem("partnershipData", JSON.stringify(completeData));
      document.cookie = "currentStep=4; path=/";
      router.push(routes.partnership4);
    },
  });

  useEffect(() => {
    const savedData = JSON.parse(sessionStorage.getItem("partnershipData") || "{}");
    formik.setValues(savedData);
  }, []);

  const handleLocationSelect = (coords, placeName) => {
    formik.setFieldValue("latitude", coords.lat);
    formik.setFieldValue("longitude", coords.lng);
    formik.setFieldValue("googleMapPlaceName", placeName || "None");
  };

  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      <div className="flex flex-row items-center">
        {/* Progress indicators */}
        <div className="p-2 border-2 border-primary rounded-full"><Check /></div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-2 border-2 border-primary rounded-full"><Check /></div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-1 border-2 border-primary rounded-full"><div className="p-3.5 bg-primary rounded-full"></div></div>
        <div className="h-[2px] w-36 border-t border-primary/50 border-dashed"></div>
        <div className="p-4 border-2 border-primary/50 rounded-full"></div>
      </div>
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 p-5">
          <CardTitle className="text-2xl">Location Information</CardTitle>
          <div className="flex flex-col gap-2">
            <Label>{"Your Shop's Google Map Location"}</Label>
            <MapPicker onLocationSelect={handleLocationSelect} />
          </div>
          <Button type="submit" className="w-full mt-4">Next</Button>
          {(formik.errors.latitude && formik.touched.latitude) && (
            <div className="text-red-500 mt-2">
              {formik.errors.latitude}
            </div>
          )}
        </form>
      </Card>
    </WebsiteLayoutWrapper>
  );
}
