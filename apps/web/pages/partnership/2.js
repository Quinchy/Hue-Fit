import { useFormik } from "formik";
import { shopInfoSchema } from "@/utils/validation-schema";
import { useRouter } from "next/router";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle, ErrorMessage } from "@/components/ui/error-message";
import FileUpload from "@/components/ui/file-upload";
import ImageUpload from "@/components/ui/image-upload";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check, Asterisk, Phone, Mail, Info, Loader } from "lucide-react";
import { useEffect, useContext, useState, useRef, useCallback  } from "react";
import { FormContext } from "@/providers/form-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import provincesData from "./data/province.json";
import municipalitiesData from "./data/municipality.json";
import barangaysData from "./data/barangay.json";
import dynamic from 'next/dynamic';
import { LoadingMessage } from "@/components/ui/loading-message";

const MapPicker = dynamic(() => import('@/components/ui/map-picker'), { ssr: false });

export default function ShopInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fieldOrder = [
    "shopLogo", "shopName", "shopContactNo", "shopEmail", "businessLicense", "buildingNo", "street", "province", "municipality", "barangay",
    "openingTime","closingTime","postalNumber", "latitude", "longitude"
  ];
  const timeOptions = [
    "6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM",
    "12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM",
    "7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM",
  ];
  const fieldRefs = fieldOrder.reduce((acc, field) => {
    acc[field] = useRef(null);
    return acc;
  }, {});
  const [initialValues, setInitialValues] = useState({
    shopName: "",shopContactNo: "",shopEmail: "",buildingNo: "",street: "",barangay: "",municipality: "",province: "",postalNumber: "",
    openingTime: "",closingTime: "",businessLicense: [],shopLogo: [],googleMapPlaceName: "",latitude: null,longitude: null,
  });
  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: shopInfoSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      updateFormData(values);
      const completeData = { ...formData, ...values };
      const formDataToSend = new FormData();

      Object.entries(completeData).forEach(([key, value]) => {
        if (key !== "businessLicense") {
          formDataToSend.append(key, value);
        }
      });

      if (completeData.businessLicense && completeData.businessLicense.length > 0) {
        completeData.businessLicense.forEach((file, index) => {
          if (file instanceof File) {
            formDataToSend.append(`businessLicense[${index}]`, file, file.name);
          }
        });
      }

      try {
        const response = await fetch("/api/partnership/send-shop-request", {
          method: "POST",
          body: formDataToSend,
        });

        if (response.ok) {
          document.cookie = "currentStep=5; path=/";
          router.push(routes.partnership5);
        } 
        else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "An error occurred");
        }
      } 
      catch (error) {
        setErrorMessage("An unexpected error occurred");
      } 
      finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    setProvinces(provincesData);
  }, []);

  useEffect(() => {
    if (formik.values.province) {
      const selectedProvince = provinces.find((option) => option.name === formik.values.province);
      if (selectedProvince) {
        const selectedProvinceCode = selectedProvince.code;
        const filteredMunicipalities = municipalitiesData.filter(
          (municipality) => municipality.provinceCode === selectedProvinceCode
        );
        setMunicipalities(filteredMunicipalities);
        setBarangays([]);
        formik.setFieldValue("municipality", "");
        formik.setFieldValue("barangay", "");
      }
    }
  }, [formik.values.province, provinces]);
  
  useEffect(() => {
    if (formik.values.municipality) {
      const selectedMunicipality = municipalitiesData.find(
        (municipality) => municipality.name === formik.values.municipality
      );
      if (selectedMunicipality) {
        const selectedMunicipalityCode = selectedMunicipality.code;
        const filteredBarangays = barangaysData.filter(
          (barangay) => barangay.municipalityCode === selectedMunicipalityCode
        );
        setBarangays(filteredBarangays);
        formik.setFieldValue("barangay", "");
      }
    }
  }, [formik.values.municipality, municipalitiesData]);  

  useEffect(() => {
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
      const errorFields = fieldOrder.filter((field) => formik.errors[field]);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        const fieldRef = fieldRefs[firstErrorField];
        if (fieldRef && fieldRef.current) {
          fieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [formik.submitCount, formik.errors]);  

  const handleLocationSelect = useCallback(
    (coords, placeName) => {
      formik.setFieldValue('latitude', coords.lat);
      formik.setFieldValue('longitude', coords.lng);
      formik.setFieldValue('googleMapPlaceName', placeName || 'None');
    },
    [formik]
  );

  useEffect(() => {
    // This effect ensures the opening and closing times are updated whenever the selects are changed
    const selectedOpeningTime = formik.values.openingTime;
    const selectedClosingTime = formik.values.closingTime;
  
    if (selectedOpeningTime) {
      formik.setFieldValue("openingTime", selectedOpeningTime);
    }
  
    if (selectedClosingTime) {
      formik.setFieldValue("closingTime", selectedClosingTime);
    }
  }, [formik.values.openingTime, formik.values.closingTime]);
  
  
  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
      {/* Progress Bar */}
      <div className="flex flex-row items-center">
        <div className="p-2 border-2 border-primary rounded-full">
          <Check />
        </div>
        <div className="h-[2px] w-36 bg-primary"></div>
        <div className="p-1 border-2 border-primary rounded-full">
          <div className="p-3.5 bg-primary rounded-full"></div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Card className="flex flex-row gap-3 w-full p-3">
          <Info />
          <p>{"To finish your vendor registration, please add the following information about your shop. This information will reflect in the Hue-Fit online shopping app."}</p>
        </Card>
        <Card className="w-full max-w-[75rem]">
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-20 p-5">
            {/* Shop Information */}
            <div className="flex flex-col gap-5">
              <CardTitle className="text-2xl">Shop Information</CardTitle>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                  <div ref={fieldRefs["shopLogo"]} className="flex flex-col gap-2">
                    <Label htmlFor="shopLogo" className="font-bold flex flex-row items-center">
                      Shop Logo{" "}
                    </Label>
                    <ImageUpload
                      onFileSelect={(files) => formik.setFieldValue("shopLogo", files)}
                      initialFiles={formik.values.shopLogo}
                      className={`${
                        formik.errors.shopLogo && formik.touched.shopLogo
                          ? "border-red-500"
                          : "border-border"
                      } min-w-[350px] max-w-[350px] min-h-[350px] max-h-[350px]`}
                    />
                    <InputErrorMessage error={formik.errors.shopLogo} touched={formik.touched.shopLogo} />
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    {/* Shop Name Field */}
                    <div ref={fieldRefs["shopName"]} className="flex flex-col gap-1">
                      <Label htmlFor="shopName" className="font-bold flex flex-row items-center ">
                        Shop Name <Asterisk className="w-4" />
                      </Label>
                      <Input
                        id="shopName" autoComplete="on" name="shopName" placeholder="Please enter the shop name"
                        {...formik.getFieldProps("shopName")} className={InputErrorStyle(formik.errors.shopName, formik.touched.shopName)}
                      />
                      <InputErrorMessage error={formik.errors.shopName} touched={formik.touched.shopName} />
                    </div>
                    {/* Shop Contact Number Field */}
                    <div ref={fieldRefs["shopContactNo"]} className="flex flex-col gap-2">
                      <Label htmlFor="shopContactNo" className="font-bold flex flex-row items-center ">
                        Shop Contact Number
                      </Label>
                      <Input
                        id="shopContactNo" name="shopContactNo" type="text" autoComplete="on" placeholder="e.g. 09959185081" variant="icon" icon={Phone}
                        {...formik.getFieldProps("shopContactNo")} className={InputErrorStyle(formik.errors.shopContactNo, formik.touched.shopContactNo)}
                      />
                      <InputErrorMessage error={formik.errors.shopContactNo} touched={formik.touched.shopContactNo}/>
                    </div>
                    {/* Shop Email Field */}
                    <div ref={fieldRefs["shopEmail"]} className="flex flex-col gap-2">
                      <Label htmlFor="shopEmail" className="font-bold flex flex-row items-center">
                        Shop Email
                      </Label>
                      <Input
                        id="shopEmail" name="shopEmail" type="email" autoComplete="on" placeholder="e.g. john@gmail.com" variant="icon" icon={Mail}
                        {...formik.getFieldProps("shopEmail")} className={InputErrorStyle(formik.errors.shopEmail, formik.touched.shopEmail)}
                      />
                      <InputErrorMessage error={formik.errors.shopEmail} touched={formik.touched.shopEmail}/>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div ref={fieldRefs["openingTime"]} className="flex flex-col gap-1">
                    <Label htmlFor="openingTime" className="font-bold flex flex-row items-center ">
                      Opening Time <Asterisk className="w-4" />
                    </Label>
                    <Select 
                      aria-labelledby="openingTime" 
                      onValueChange={(value) => {
                        formik.setFieldValue("openingTime", value);
                      }}
                      value={formik.values.openingTime || ""}
                    >
                      <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.openingTime, formik.touched.openingTime)}`}>
                        <SelectValue placeholder="Select opening time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time, index) => (
                          <SelectItem key={index} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InputErrorMessage error={formik.errors.openingTime} touched={formik.touched.openingTime} />
                  </div>
                  <div ref={fieldRefs["closingTime"]} className="flex flex-col gap-1">
                    <Label htmlFor="closingTime" className="font-bold flex flex-row items-center ">
                      Closing Time <Asterisk className="w-4" />
                    </Label>
                    <Select 
                      aria-labelledby="closingTime" 
                      onValueChange={(value) => {
                        formik.setFieldValue("closingTime", value);
                      }}
                      value={formik.values.closingTime || ""}
                    >
                      <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.closingTime, formik.touched.closingTime)}`}>
                        <SelectValue placeholder="Select closing time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time, index) => (
                          <SelectItem key={index} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <InputErrorMessage error={formik.errors.closingTime} touched={formik.touched.closingTime} />
                  </div>
                </div>
                <div ref={fieldRefs["businessLicense"]} className="flex flex-col gap-2">
                  <div className="flex flex-col">
                    <Label htmlFor="businessLicense" className="font-bold flex flex-row items-center">
                      Business License <Asterisk className="w-4" />
                    </Label>
                    <p className="font-light text-primary/75">
                      {"Please add a copy of your shop's business license below. Example documents are, Business Registration Certificate, Mayor's Permit or Business Permit, etc. (You can choose any between, Maximum is 5.)"}
                    </p>
                  </div>
                  <FileUpload
                    onFileSelect={(files) => formik.setFieldValue("businessLicense", files)} initialFiles={formik.values.businessLicense}
                    className={`w-full h-[400px] ${formik.errors.businessLicense && formik.touched.businessLicense  ? "border-red-500" : "border-border"}`}
                    maxFiles={5}
                  />
                  <InputErrorMessage error={formik.errors.businessLicense} touched={formik.touched.businessLicense} />
                </div>
              </div>
            </div>
            {/* Shop Address Information */}
            <div className="flex flex-col gap-5">
              <CardTitle className="text-2xl">Shop Address Information</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                {/* Province Field */}
                <div ref={fieldRefs["province"]} className="flex flex-col gap-1">
                  <Label htmlFor="province" className="font-bold flex flex-row items-center ">
                    Province <Asterisk className="w-4" />
                  </Label>
                  <Select 
                    aria-labelledby="province" 
                    onValueChange={(value) => {
                      const selectedProvince = provinces.find((option) => option.code === value);
                      if (selectedProvince) {
                        formik.setFieldValue("province", selectedProvince.name);
                      }
                    }}
                    value={provinces.find((option) => option.name === formik.values.province)?.code || ""}
                  >
                    <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.province, formik.touched.province)}`}>
                      <SelectValue placeholder="Please select a province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((option, index) => (
                        <SelectItem key={index} value={option.code}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputErrorMessage error={formik.errors.province} touched={formik.touched.province}/>
                </div>
                {/* Municipality Field */}
                <div ref={fieldRefs["municipality"]} className="flex flex-col gap-1">
                  <Label htmlFor="municipality" className="font-bold flex flex-row items-center ">
                    Municipality <Asterisk className="w-4" />
                  </Label>
                  <Select 
                    onValueChange={(value) => formik.setFieldValue("municipality", value)} aria-labelledby="municipality"
                    value={formik.values.municipality} disabled={formik.values.province === ""}
                  >
                    <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.municipality,formik.touched.municipality)}`}>
                      <SelectValue placeholder="Please select a municipality" />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map((option, index) => (
                        <SelectItem key={index} value={option.name}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputErrorMessage error={formik.errors.municipality} touched={formik.touched.municipality}/>
                </div>
                {/* Barangay Field */}
                <div ref={fieldRefs["barangay"]} className="flex flex-col gap-1">
                  <Label htmlFor="barangay" className="font-bold flex flex-row items-center " >
                    Barangay <Asterisk className="w-4" />
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedBarangay = barangays.find((option) => option.code === value);
                      if (selectedBarangay) {
                        formik.setFieldValue("barangay", selectedBarangay.name); // Set barangay name
                      }
                    }}
                    aria-labelledby="barangay"
                    value={barangays.find((option) => option.name === formik.values.barangay)?.code || ""}
                    disabled={formik.values.municipality === ""}
                  >
                    <SelectTrigger className={`w-full ${InputErrorStyle(formik.errors.barangay, formik.touched.barangay)}`}>
                      <SelectValue placeholder="Please select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((option, index) => (
                        <SelectItem key={index} value={option.code}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <InputErrorMessage error={formik.errors.barangay} touched={formik.touched.barangay}/>
                </div>
                {/* Postal Number Field */}
                <div ref={fieldRefs["postalNumber"]} className="flex flex-col gap-1">
                  <Label htmlFor="postalNumber" className="font-bold flex flex-row items-center ">
                    Postal Number <Asterisk className="w-4" />
                  </Label>
                  <Input
                    id="postalNumber" name="postalNumber" autoComplete="on" placeholder="Please enter the postal number"
                    {...formik.getFieldProps("postalNumber")} className={InputErrorStyle(formik.errors.postalNumber, formik.touched.postalNumber)}
                  />
                  <InputErrorMessage error={formik.errors.postalNumber} touched={formik.touched.postalNumber} />
                </div>
                {/* Building Number Field */}
                <div ref={fieldRefs["buildingNo"]} className="flex flex-col gap-2">
                  <Label htmlFor="buildingNo" className="font-bold flex flex-row items-center">
                    Building Number
                  </Label>
                  <Input 
                    id="buildingNo" autoComplete="on" name="buildingNo" placeholder="Please enter the building number"
                    {...formik.getFieldProps("buildingNo")} className={InputErrorStyle(formik.errors.buildingNo, formik.touched.buildingNo)}
                  />
                  <InputErrorMessage error={formik.errors.buildingNo} touched={formik.touched.buildingNo} />
                </div>
                {/* Street Field */}
                <div ref={fieldRefs["street"]} className="flex flex-col gap-2">
                  <Label htmlFor="street" className="font-bold flex flex-row items-center ">
                    Street
                  </Label>
                  <Input
                    id="street" autoComplete="on" name="street" placeholder="Please enter the street name"
                    {...formik.getFieldProps("street")} className={InputErrorStyle(formik.errors.street, formik.touched.street)}
                  />
                  <InputErrorMessage error={formik.errors.street} touched={formik.touched.street} />
                </div>
              </div>
            </div>
            {/* Google Map Location Information */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl">Google Map Location Information</CardTitle>
                <p className="font-light text-primary/75">
                  {"Pinpoint your shop's exact location on the map. If your shop is available on Google Maps, you can search it or pin it yourself."}
                </p>
              </div>
              <div ref={fieldRefs["latitude"]} className="flex flex-col gap-2">
                <Label className={`font-bold flex flex-row items-center`}>
                  {"Your Shop's Google Map Location"}
                  <Asterisk className="w-4" />
                </Label>
                <MapPicker onLocationSelect={handleLocationSelect} />
                <div className="flex flex-col items-center justify-center">
                  <InputErrorMessage error={formik.errors.latitude} touched={formik.touched.latitude} />
                  <InputErrorMessage error={formik.errors.longitude} touched={formik.touched.longitude} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-5 items-center">              
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? <LoadingMessage message="Submitting..." /> : "Submit"}
              </Button>
              {errorMessage && (
                <ErrorMessage message={errorMessage} className="mt-2" />
              )}
            </div>
          </form>
        </Card>
      </div>
    </WebsiteLayoutWrapper>
  );
}
