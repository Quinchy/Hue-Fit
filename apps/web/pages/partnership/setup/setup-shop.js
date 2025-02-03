// components/SetupShopForm.jsx
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import { shopInfoSchema } from "@/utils/validation-schema";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle, ErrorMessage } from "@/components/ui/error-message";
import FileUpload from "@/components/ui/file-upload";
import ImageUpload from "@/components/ui/image-upload";
import { Asterisk, Phone, Mail, Info, LogOut, Store } from "lucide-react";
import HueFitLogo from '@/public/images/HueFitLogo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import provincesData from "./data/province.json";
import municipalitiesData from "./data/municipality.json";
import barangaysData from "./data/barangay.json";
import dynamic from "next/dynamic";
import { LoadingMessage } from "@/components/ui/loading-message";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const MapPicker = dynamic(() => import("@/components/ui/map-picker"), { ssr: false });

export default function SetupShopForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [partnershipRequest, setPartnershipRequest] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const timeOptions = useMemo(
    () => [
      "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
      "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
      "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
      "10:00 PM",
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

  const initialValues = {
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
  };

  const formik = useFormik({
    initialValues,
    validationSchema: shopInfoSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      const formDataToSend = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === "businessLicense") return;
        else if (key === "shopLogo") {
          if (value && value.length > 0 && value[0] instanceof File) {
            formDataToSend.append(key, value[0], value[0].name);
          }
        } else {
          formDataToSend.append(key, value);
        }
      });
      if (values.businessLicense && values.businessLicense.length > 0) {
        values.businessLicense.forEach((file, index) => {
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
        const data = await response.json();
        if (response.ok) {
          setPartnershipRequest(data);
          setEditMode(false);
        } else {
          setErrorMessage(data.message || "An error occurred");
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
  });

  const { values, errors, touched, setFieldValue, submitCount } = formik;

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
    if (loading) return;
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
  }, [submitCount, errors, loading, fieldOrder]);

  useEffect(() => {
    async function fetchPartnershipRequest() {
      const res = await fetch("/api/partnership/get-request");
      if (res.ok) {
        const data = await res.json();
        setPartnershipRequest(data);
        formik.setValues({
          shopName: data.shop?.name || "",
          shopContactNo: data.shop?.contactNo || "",
          shopEmail: data.shop?.email || "",
          buildingNo: data.address?.buildingNo || "",
          street: data.address?.street || "",
          barangay: data.address?.barangay || "",
          municipality: data.address?.municipality || "",
          province: data.address?.province || "",
          postalNumber: data.address?.postalCode || "",
          openingTime: data.shop?.openingTime || "",
          closingTime: data.shop?.closingTime || "",
          businessLicense: data.shop?.BusinessLicense 
          ? data.shop.BusinessLicense.map(item => item.licenseUrl)
          : [],
          shopLogo: data.shop?.logo || "",
          googleMapPlaceName: data.address?.googleMapLocation ? (data.address.googleMapLocation.name || "") : "",
          latitude: data.address?.googleMapLocation ? data.address.googleMapLocation.latitude : null,
          longitude: data.address?.googleMapLocation ? data.address.googleMapLocation.longitude : null,
        });
      }
    }
    fetchPartnershipRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = useCallback(
    (coords, placeName) => {
      setFieldValue("latitude", coords.lat);
      setFieldValue("longitude", coords.lng);
      setFieldValue("googleMapPlaceName", placeName || "None");
    },
    [setFieldValue]
  );

  const isFormDisabled = partnershipRequest && !editMode;
  const initialMapPosition =
    values.latitude && values.longitude ? { lat: values.latitude, lng: values.longitude } : null;

  return (
    <div className="mt-24 mb-24 flex flex-col w-full justify-center items-center gap-3">
      <div className="flex flex-row items-center justify-between gap-3 w-full max-w-[75rem] mb-10">
        <HueFitLogo height={75} className="fill-primary" />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="border px-10 py-3 flex gap-2 rounded-lg border-primary font-medium hover:border-primary/50 hover:text-primary/50 hover:stroke-primary/50 duration-300 ease-in-out"
        >
          <LogOut />
          Logout
        </button>
      </div>
      {partnershipRequest && (
        <div className="flex flex-row gap-4 w-full max-w-[75rem] justify-end">
          <Button variant="outline" onClick={() => setEditMode(true)}>
            Edit
          </Button>
          <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">View Status</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  <Store className="stroke-[2.5px] mr-2" />
                  Partnership Request Status
                </DialogTitle>
                <DialogDescription>
                  {partnershipRequest.status === "PENDING"
                    ? "Your shop is being processed. Please keep an eye on your email for updates."
                    : `Your request status is: ${partnershipRequest.status}`}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      )}
      <Card className="flex flex-row gap-3 w-full max-w-[75rem] p-3">
        <Info />
        <p>
          {session?.user?.firstName ? `Hi, ${session.user.firstName}. ` : ""}
          {isFormDisabled
            ? "Your shop request has been submitted. You can edit your information if needed."
            : "Before accessing the Dashboard, please setup your shop by filling out the information below. This will help us verify your shop."}
        </p>
      </Card>
      <Card className="w-full max-w-[75rem]">
        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-20 p-5">
          {/* Shop Information */}
          <div className="flex flex-col gap-5">
            <CardTitle className="text-2xl">Shop Information</CardTitle>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row gap-3">
                <div ref={(el) => (fieldRefs.current["shopLogo"] = el)} className="flex flex-col gap-2">
                  <Label htmlFor="shopLogoFile" className="font-bold flex flex-row items-center">
                    Shop Logo <Asterisk className="w-4" />
                  </Label>
                  <ImageUpload
                    inputId="shopLogoFile"
                    onFileSelect={(files) => setFieldValue("shopLogo", files)}
                    initialFiles={values.shopLogo}
                    disabled={isFormDisabled}
                    className={`${
                      errors.shopLogo && touched.shopLogo ? "border-red-500" : "border-border"
                    } min-w-[350px] max-w-[350px] min-h-[350px] max-h-[350px]`}
                  />
                  <InputErrorMessage error={errors.shopLogo} touched={touched.shopLogo} />
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <div ref={(el) => (fieldRefs.current["shopName"] = el)} className="flex flex-col gap-1">
                    <Label htmlFor="shopName" className="font-bold flex flex-row items-center">
                      Shop Name <Asterisk className="w-4" />
                    </Label>
                    <Input
                      id="shopName"
                      autoComplete="on"
                      name="shopName"
                      placeholder="Please enter the shop name"
                      disabled={isFormDisabled}
                      {...formik.getFieldProps("shopName")}
                      className={InputErrorStyle(errors.shopName, touched.shopName)}
                    />
                    <InputErrorMessage error={errors.shopName} touched={touched.shopName} />
                  </div>
                  <div ref={(el) => (fieldRefs.current["shopContactNo"] = el)} className="flex flex-col gap-2">
                    <Label htmlFor="shopContactNo" className="font-bold flex flex-row items-center">
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
                      disabled={isFormDisabled}
                      {...formik.getFieldProps("shopContactNo")}
                      className={InputErrorStyle(errors.shopContactNo, touched.shopContactNo)}
                    />
                    <InputErrorMessage error={errors.shopContactNo} touched={touched.shopContactNo} />
                  </div>
                  <div ref={(el) => (fieldRefs.current["shopEmail"] = el)} className="flex flex-col gap-2">
                    <Label htmlFor="shopEmail" className="font-bold flex flex-row items-center">
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
                      disabled={isFormDisabled}
                      {...formik.getFieldProps("shopEmail")}
                      className={InputErrorStyle(errors.shopEmail, touched.shopEmail)}
                    />
                    <InputErrorMessage error={errors.shopEmail} touched={touched.shopEmail} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div ref={(el) => (fieldRefs.current["openingTime"] = el)} className="flex flex-col gap-1">
                  <Label htmlFor="openingTime" className="font-bold flex flex-row items-center">
                    Opening Time <Asterisk className="w-4" />
                  </Label>
                  <Select
                    aria-labelledby="openingTime"
                    onValueChange={(value) => setFieldValue("openingTime", value)}
                    value={values.openingTime || ""}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className={`w-full ${InputErrorStyle(errors.openingTime, touched.openingTime)}`}>
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
                  <InputErrorMessage error={errors.openingTime} touched={touched.openingTime} />
                </div>
                <div ref={(el) => (fieldRefs.current["closingTime"] = el)} className="flex flex-col gap-1">
                  <Label htmlFor="closingTime" className="font-bold flex flex-row items-center">
                    Closing Time <Asterisk className="w-4" />
                  </Label>
                  <Select
                    aria-labelledby="closingTime"
                    onValueChange={(value) => setFieldValue("closingTime", value)}
                    value={values.closingTime || ""}
                    disabled={isFormDisabled}
                  >
                    <SelectTrigger className={`w-full ${InputErrorStyle(errors.closingTime, touched.closingTime)}`}>
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
                  <InputErrorMessage error={errors.closingTime} touched={touched.closingTime} />
                </div>
              </div>
              <div ref={(el) => (fieldRefs.current["businessLicense"] = el)} className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="businessLicense" className="font-bold flex flex-row items-center">
                    Business License <Asterisk className="w-4" />
                  </Label>
                  <p className="font-light text-primary/75">
                    {"Please add a copy of your shop's business license. Example documents include:"}
                    <span className="italic">
                      {"Business Registration Certificate, Mayor's Permit, or Business Permit."}
                    </span>
                  </p>
                </div>
                <FileUpload
                  onFileSelect={(files) => setFieldValue("businessLicense", files)}
                  initialFiles={values.businessLicense}
                  disabled={isFormDisabled}
                  className={`w-full h-[400px] ${errors.businessLicense && touched.businessLicense ? "border-red-500" : "border-border"}`}
                  maxFiles={5}
                />
                <InputErrorMessage error={errors.businessLicense} touched={touched.businessLicense} />
              </div>
            </div>
          </div>
          {/* Shop Address Information */}
          <div className="flex flex-col gap-5">
            <CardTitle className="text-2xl">Shop Address Information</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div ref={(el) => (fieldRefs.current["province"] = el)} className="flex flex-col gap-1">
                <Label htmlFor="province" className="font-bold flex flex-row items-center">
                  Province <Asterisk className="w-4" />
                </Label>
                <Select
                  aria-labelledby="province"
                  onValueChange={(value) => {
                    const selectedProvince = provinces.find((option) => option.code === value);
                    if (selectedProvince) {
                      setFieldValue("province", selectedProvince.name);
                    }
                  }}
                  value={provinces.find((option) => option.name === values.province)?.code || ""}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className={`w-full ${InputErrorStyle(errors.province, touched.province)}`}>
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
                <InputErrorMessage error={errors.province} touched={touched.province} />
              </div>
              <div ref={(el) => (fieldRefs.current["municipality"] = el)} className="flex flex-col gap-1">
                <Label htmlFor="municipality" className="font-bold flex flex-row items-center">
                  Municipality <Asterisk className="w-4" />
                </Label>
                <Select
                  onValueChange={(value) => setFieldValue("municipality", value)}
                  aria-labelledby="municipality"
                  value={values.municipality}
                  disabled={values.province === "" || isFormDisabled}
                >
                  <SelectTrigger className={`w-full ${InputErrorStyle(errors.municipality, touched.municipality)}`}>
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
                <InputErrorMessage error={errors.municipality} touched={touched.municipality} />
              </div>
              <div ref={(el) => (fieldRefs.current["barangay"] = el)} className="flex flex-col gap-1">
                <Label htmlFor="barangay" className="font-bold flex flex-row items-center">
                  Barangay <Asterisk className="w-4" />
                </Label>
                <Select
                  onValueChange={(value) => {
                    const selectedBarangay = barangays.find((option) => option.code === value);
                    if (selectedBarangay) {
                      setFieldValue("barangay", selectedBarangay.name);
                    }
                  }}
                  aria-labelledby="barangay"
                  value={barangays.find((option) => option.name === values.barangay)?.code || ""}
                  disabled={values.municipality === "" || isFormDisabled}
                >
                  <SelectTrigger className={`w-full ${InputErrorStyle(errors.barangay, touched.barangay)}`}>
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
                <InputErrorMessage error={errors.barangay} touched={touched.barangay} />
              </div>
              <div ref={(el) => (fieldRefs.current["postalNumber"] = el)} className="flex flex-col gap-1">
                <Label htmlFor="postalNumber" className="font-bold flex flex-row items-center">
                  Postal Number <Asterisk className="w-4" />
                </Label>
                <Input
                  id="postalNumber"
                  name="postalNumber"
                  autoComplete="on"
                  placeholder="Please enter the postal number"
                  disabled={isFormDisabled}
                  {...formik.getFieldProps("postalNumber")}
                  className={InputErrorStyle(errors.postalNumber, touched.postalNumber)}
                />
                <InputErrorMessage error={errors.postalNumber} touched={touched.postalNumber} />
              </div>
              <div ref={(el) => (fieldRefs.current["buildingNo"] = el)} className="flex flex-col gap-2">
                <Label htmlFor="buildingNo" className="font-bold flex flex-row items-center">
                  Building Number
                </Label>
                <Input
                  id="buildingNo"
                  autoComplete="on"
                  name="buildingNo"
                  placeholder="Please enter the building number"
                  disabled={isFormDisabled}
                  {...formik.getFieldProps("buildingNo")}
                  className={InputErrorStyle(errors.buildingNo, touched.buildingNo)}
                />
                <InputErrorMessage error={errors.buildingNo} touched={touched.buildingNo} />
              </div>
              <div ref={(el) => (fieldRefs.current["street"] = el)} className="flex flex-col gap-2">
                <Label htmlFor="street" className="font-bold flex flex-row items-center">
                  Street
                </Label>
                <Input
                  id="street"
                  autoComplete="on"
                  name="street"
                  placeholder="Please enter the street name"
                  disabled={isFormDisabled}
                  {...formik.getFieldProps("street")}
                  className={InputErrorStyle(errors.street, touched.street)}
                />
                <InputErrorMessage error={errors.street} touched={touched.street} />
              </div>
            </div>
          </div>
          {/* Google Map Location Information */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-2xl">Google Map Location Information</CardTitle>
              <p className="font-light text-primary/75">
                {"Pinpoint your shop's exact location on the map. You can search for a location or manually select it."}
              </p>
            </div>
            <div ref={(el) => (fieldRefs.current["latitude"] = el)} className="flex flex-col gap-2">
              <Label className="font-bold flex flex-row items-center">
                {"Your Shop's Google Map Location"} <Asterisk className="w-4" />
              </Label>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                disabled={isFormDisabled}
                initialPosition={initialMapPosition}
                initialPlaceName={values.googleMapPlaceName}
              />
              <div className="flex flex-col items-center justify-center">
                <InputErrorMessage error={errors.latitude} touched={touched.latitude} />
                <InputErrorMessage error={errors.longitude} touched={touched.longitude} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-5 items-center">
            <Button type="submit" className="w-full mt-4" disabled={loading || isFormDisabled}>
              {loading ? <LoadingMessage message="Submitting..." /> : "Submit"}
            </Button>
            {errorMessage && <ErrorMessage message={errorMessage} className="mt-2" />}
          </div>
        </form>
      </Card>
    </div>
  );
}
