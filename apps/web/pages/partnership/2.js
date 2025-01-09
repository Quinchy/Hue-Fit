import { useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { shopInfoSchema } from "@/utils/validation-schema";
import routes from "@/routes";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  InputErrorMessage,
  InputErrorStyle,
  ErrorMessage,
} from "@/components/ui/error-message";
import FileUpload from "@/components/ui/file-upload";
import ImageUpload from "@/components/ui/image-upload";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Check, Asterisk, Phone, Mail, Info } from "lucide-react";
import { FormContext } from "@/providers/form-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import provincesData from "./data/province.json";
import municipalitiesData from "./data/municipality.json";
import barangaysData from "./data/barangay.json";
import dynamic from "next/dynamic";
import { LoadingMessage } from "@/components/ui/loading-message";

const MapPicker = dynamic(() => import("@/components/ui/map-picker"), { ssr: false });

export default function ShopInformationStep() {
  const router = useRouter();
  const { formData, updateFormData } = useContext(FormContext);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const timeOptions = useMemo(
    () => [
      "6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
      "12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM",
      "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM",
    ],
    []
  );

  const fieldOrder = useMemo(
    () => [
      "shopLogo",
      "shopName",
      "shopContactNo",
      "shopEmail",
      "businessLicense",
      "buildingNo",
      "street",
      "province",
      "municipality",
      "barangay",
      "openingTime",
      "closingTime",
      "postalNumber",
      "latitude",
      "longitude",
    ],
    []
  );

  const fieldRefs = useRef(
    fieldOrder.reduce((acc, field) => {
      acc[field] = null;
      return acc;
    }, {})
  );

  const [initialValues, setInitialValues] = useState({
    shopName: "",
    shopContactNo: "",
    shopEmail: "",
    buildingNo: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    postalNumber: "",
    openingTime: "",
    closingTime: "",
    businessLicense: [],
    shopLogo: [],
    googleMapPlaceName: "",
    latitude: null,
    longitude: null,
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
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "An error occurred");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    handleChange,
    submitCount,
  } = formik;

  useEffect(() => {
    setProvinces(provincesData);
  }, []);

  useEffect(() => {
    if (values.province) {
      const selectedProvince = provinces.find(
        (option) => option.name === values.province
      );
      if (selectedProvince) {
        const selectedProvinceCode = selectedProvince.code;
        const filteredMunicipalities = municipalitiesData.filter(
          (municipality) => municipality.provinceCode === selectedProvinceCode
        );
        setMunicipalities(filteredMunicipalities);
        setBarangays([]);
      } else {
        setMunicipalities([]);
        setBarangays([]);
      }
    } else {
      setMunicipalities([]);
      setBarangays([]);
    }
  }, [values.province, provinces]);

  useEffect(() => {
    if (values.municipality) {
      const selectedMunicipality = municipalitiesData.find(
        (municipality) => municipality.name === values.municipality
      );
      if (selectedMunicipality) {
        const selectedMunicipalityCode = selectedMunicipality.code;
        const filteredBarangays = barangaysData.filter(
          (barangay) => barangay.municipalityCode === selectedMunicipalityCode
        );
        setBarangays(filteredBarangays);
      } else {
        setBarangays([]);
      }
    } else {
      setBarangays([]);
    }
  }, [values.municipality]);

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const errorFields = fieldOrder.filter((field) => errors[field]);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [submitCount, errors, fieldOrder]);

  const handleLocationSelect = useCallback(
    (coords, placeName) => {
      formik.setFieldValue("latitude", coords.lat);
      formik.setFieldValue("longitude", coords.lng);
      formik.setFieldValue("googleMapPlaceName", placeName || "None");
    },
    [formik]
  );

  return (
    <WebsiteLayoutWrapper className="justify-center items-center">
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
          <p>
            {
              "To finish your vendor registration, please add the following information about your shop. This information will reflect in the Hue-Fit online shopping app."
            }
          </p>
        </Card>
        <Card className="w-full max-w-[75rem]">
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-20 p-5">
            <div className="flex flex-col gap-5">
              <CardTitle className="text-2xl">Shop Information</CardTitle>
              <div className="flex flex-col gap-3">
                <div className="flex flex-row gap-3">
                  <div
                    ref={(el) => (fieldRefs.current["shopLogo"] = el)}
                    className="flex flex-col gap-2"
                  >
                    <Label
                      htmlFor="shopLogoFile"
                      className="font-bold flex flex-row items-center"
                    >
                      Shop Logo <Asterisk className="ml-1" />
                    </Label>
                    <ImageUpload
                      inputId="shopLogoFile"
                      onFileSelect={(files) => setFieldValue("shopLogo", files)}
                      initialFiles={values.shopLogo}
                      className={`${
                        errors.shopLogo && touched.shopLogo
                          ? "border-red-500"
                          : "border-border"
                      } min-w-[350px] max-w-[350px] min-h-[350px] max-h-[350px]`}
                    />
                    <InputErrorMessage
                      error={errors.shopLogo}
                      touched={touched.shopLogo}
                    />
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <div
                      ref={(el) => (fieldRefs.current["shopName"] = el)}
                      className="flex flex-col gap-1"
                    >
                      <Label
                        htmlFor="shopName"
                        className="font-bold flex flex-row items-center "
                      >
                        Shop Name <Asterisk className="w-4" />
                      </Label>
                      <Input
                        id="shopName"
                        autoComplete="on"
                        name="shopName"
                        placeholder="Please enter the shop name"
                        {...formik.getFieldProps("shopName")}
                        className={InputErrorStyle(
                          errors.shopName,
                          touched.shopName
                        )}
                      />
                      <InputErrorMessage
                        error={errors.shopName}
                        touched={touched.shopName}
                      />
                    </div>
                    <div
                      ref={(el) => (fieldRefs.current["shopContactNo"] = el)}
                      className="flex flex-col gap-2"
                    >
                      <Label
                        htmlFor="shopContactNo"
                        className="font-bold flex flex-row items-center "
                      >
                        Shop Contact Number
                      </Label>
                      <Input
                        id="shopContactNo"
                        name="shopContactNo"
                        type="text"
                        autoComplete="on"
                        placeholder="e.g. 09959185081"
                        variant="icon"
                        icon={Phone}
                        {...formik.getFieldProps("shopContactNo")}
                        className={InputErrorStyle(
                          errors.shopContactNo,
                          touched.shopContactNo
                        )}
                      />
                      <InputErrorMessage
                        error={errors.shopContactNo}
                        touched={touched.shopContactNo}
                      />
                    </div>
                    <div
                      ref={(el) => (fieldRefs.current["shopEmail"] = el)}
                      className="flex flex-col gap-2"
                    >
                      <Label
                        htmlFor="shopEmail"
                        className="font-bold flex flex-row items-center"
                      >
                        Shop Email
                      </Label>
                      <Input
                        id="shopEmail"
                        name="shopEmail"
                        type="email"
                        autoComplete="on"
                        placeholder="e.g. john@gmail.com"
                        variant="icon"
                        icon={Mail}
                        {...formik.getFieldProps("shopEmail")}
                        className={InputErrorStyle(
                          errors.shopEmail,
                          touched.shopEmail
                        )}
                      />
                      <InputErrorMessage
                        error={errors.shopEmail}
                        touched={touched.shopEmail}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    ref={(el) => (fieldRefs.current["openingTime"] = el)}
                    className="flex flex-col gap-1"
                  >
                    <Label
                      htmlFor="openingTime"
                      className="font-bold flex flex-row items-center "
                    >
                      Opening Time <Asterisk className="w-4" />
                    </Label>
                    <Select
                      aria-labelledby="openingTime"
                      onValueChange={(value) => setFieldValue("openingTime", value)}
                      value={values.openingTime || ""}
                    >
                      <SelectTrigger
                        className={`w-full ${InputErrorStyle(
                          errors.openingTime,
                          touched.openingTime
                        )}`}
                      >
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
                    <InputErrorMessage
                      error={errors.openingTime}
                      touched={touched.openingTime}
                    />
                  </div>
                  <div
                    ref={(el) => (fieldRefs.current["closingTime"] = el)}
                    className="flex flex-col gap-1"
                  >
                    <Label
                      htmlFor="closingTime"
                      className="font-bold flex flex-row items-center "
                    >
                      Closing Time <Asterisk className="w-4" />
                    </Label>
                    <Select
                      aria-labelledby="closingTime"
                      onValueChange={(value) => setFieldValue("closingTime", value)}
                      value={values.closingTime || ""}
                    >
                      <SelectTrigger
                        className={`w-full ${InputErrorStyle(
                          errors.closingTime,
                          touched.closingTime
                        )}`}
                      >
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
                    <InputErrorMessage
                      error={errors.closingTime}
                      touched={touched.closingTime}
                    />
                  </div>
                </div>
                <div
                  ref={(el) => (fieldRefs.current["businessLicense"] = el)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-col">
                    <Label
                      htmlFor="businessLicense"
                      className="font-bold flex flex-row items-center"
                    >
                      Business License <Asterisk className="w-4" />
                    </Label>
                    <p className="font-light text-primary/75">
                      {
                        "Please add a copy of your shop's business license below. Example documents are, Business Registration Certificate, Mayor's Permit or Business Permit, etc. (You can choose any between, Maximum is 5.)"
                      }
                    </p>
                  </div>
                  <FileUpload
                    onFileSelect={(files) => setFieldValue("businessLicense", files)}
                    initialFiles={values.businessLicense}
                    className={`w-full h-[400px] ${
                      errors.businessLicense && touched.businessLicense
                        ? "border-red-500"
                        : "border-border"
                    }`}
                    maxFiles={5}
                  />
                  <InputErrorMessage
                    error={errors.businessLicense}
                    touched={touched.businessLicense}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <CardTitle className="text-2xl">Shop Address Information</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div
                  ref={(el) => (fieldRefs.current["province"] = el)}
                  className="flex flex-col gap-1"
                >
                  <Label
                    htmlFor="province"
                    className="font-bold flex flex-row items-center "
                  >
                    Province <Asterisk className="w-4" />
                  </Label>
                  <Select
                    aria-labelledby="province"
                    onValueChange={(value) => {
                      const selectedProvince = provinces.find(
                        (option) => option.code === value
                      );
                      if (selectedProvince) {
                        setFieldValue("province", selectedProvince.name);
                      }
                    }}
                    value={
                      provinces.find((option) => option.name === values.province)
                        ?.code || ""
                    }
                  >
                    <SelectTrigger
                      className={`w-full ${InputErrorStyle(
                        errors.province,
                        touched.province
                      )}`}
                    >
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
                  <InputErrorMessage
                    error={errors.province}
                    touched={touched.province}
                  />
                </div>

                <div
                  ref={(el) => (fieldRefs.current["municipality"] = el)}
                  className="flex flex-col gap-1"
                >
                  <Label
                    htmlFor="municipality"
                    className="font-bold flex flex-row items-center "
                  >
                    Municipality <Asterisk className="w-4" />
                  </Label>
                  <Select
                    onValueChange={(value) => setFieldValue("municipality", value)}
                    aria-labelledby="municipality"
                    value={values.municipality}
                    disabled={values.province === ""}
                  >
                    <SelectTrigger
                      className={`w-full ${InputErrorStyle(
                        errors.municipality,
                        touched.municipality
                      )}`}
                    >
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
                  <InputErrorMessage
                    error={errors.municipality}
                    touched={touched.municipality}
                  />
                </div>

                <div
                  ref={(el) => (fieldRefs.current["barangay"] = el)}
                  className="flex flex-col gap-1"
                >
                  <Label
                    htmlFor="barangay"
                    className="font-bold flex flex-row items-center "
                  >
                    Barangay <Asterisk className="w-4" />
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedBarangay = barangays.find(
                        (option) => option.code === value
                      );
                      if (selectedBarangay) {
                        setFieldValue("barangay", selectedBarangay.name);
                      }
                    }}
                    aria-labelledby="barangay"
                    value={
                      barangays.find(
                        (option) => option.name === values.barangay
                      )?.code || ""
                    }
                    disabled={values.municipality === ""}
                  >
                    <SelectTrigger
                      className={`w-full ${InputErrorStyle(
                        errors.barangay,
                        touched.barangay
                      )}`}
                    >
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
                  <InputErrorMessage
                    error={errors.barangay}
                    touched={touched.barangay}
                  />
                </div>

                <div
                  ref={(el) => (fieldRefs.current["postalNumber"] = el)}
                  className="flex flex-col gap-1"
                >
                  <Label
                    htmlFor="postalNumber"
                    className="font-bold flex flex-row items-center "
                  >
                    Postal Number <Asterisk className="w-4" />
                  </Label>
                  <Input
                    id="postalNumber"
                    name="postalNumber"
                    autoComplete="on"
                    placeholder="Please enter the postal number"
                    {...formik.getFieldProps("postalNumber")}
                    className={InputErrorStyle(
                      errors.postalNumber,
                      touched.postalNumber
                    )}
                  />
                  <InputErrorMessage
                    error={errors.postalNumber}
                    touched={touched.postalNumber}
                  />
                </div>

                <div
                  ref={(el) => (fieldRefs.current["buildingNo"] = el)}
                  className="flex flex-col gap-2"
                >
                  <Label
                    htmlFor="buildingNo"
                    className="font-bold flex flex-row items-center"
                  >
                    Building Number
                  </Label>
                  <Input
                    id="buildingNo"
                    autoComplete="on"
                    name="buildingNo"
                    placeholder="Please enter the building number"
                    {...formik.getFieldProps("buildingNo")}
                    className={InputErrorStyle(
                      errors.buildingNo,
                      touched.buildingNo
                    )}
                  />
                  <InputErrorMessage
                    error={errors.buildingNo}
                    touched={touched.buildingNo}
                  />
                </div>

                <div
                  ref={(el) => (fieldRefs.current["street"] = el)}
                  className="flex flex-col gap-2"
                >
                  <Label
                    htmlFor="street"
                    className="font-bold flex flex-row items-center "
                  >
                    Street
                  </Label>
                  <Input
                    id="street"
                    autoComplete="on"
                    name="street"
                    placeholder="Please enter the street name"
                    {...formik.getFieldProps("street")}
                    className={InputErrorStyle(errors.street, touched.street)}
                  />
                  <InputErrorMessage
                    error={errors.street}
                    touched={touched.street}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl">
                  Google Map Location Information
                </CardTitle>
                <p className="font-light text-primary/75">
                  {
                    "Pinpoint your shop's exact location on the map. If your shop is available on Google Maps, you can search it or pin it yourself."
                  }
                </p>
              </div>
              <div
                ref={(el) => (fieldRefs.current["latitude"] = el)}
                className="flex flex-col gap-2"
              >
                <Label className="font-bold flex flex-row items-center">
                  {"Your Shop's Google Map Location"} <Asterisk className="w-4" />
                </Label>
                <MapPicker
                  onLocationSelect={useCallback(
                    (coords, placeName) => {
                      setFieldValue("latitude", coords.lat);
                      setFieldValue("longitude", coords.lng);
                      setFieldValue("googleMapPlaceName", placeName || "None");
                    },
                    [setFieldValue]
                  )}
                />
                <div className="flex flex-col items-center justify-center">
                  <InputErrorMessage
                    error={errors.latitude}
                    touched={touched.latitude}
                  />
                  <InputErrorMessage
                    error={errors.longitude}
                    touched={touched.longitude}
                  />
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
