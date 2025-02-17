"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Loading from "@/components/ui/loading";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CircleAlert, CircleCheck, X, Pencil, Upload, Loader, Asterisk } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputErrorMessage, InputErrorStyle } from "@/components/ui/error-message";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamically import MapPicker (client-side only)
const MapPicker = dynamic(() => import("@/components/ui/map-picker"), { ssr: false });

const shopProfileSchema = Yup.object().shape({
  name: Yup.string().required("Shop name is required."),
  email: Yup.string().email("Invalid email").required("Email is required."),
  contactNo: Yup.string().required("Contact number is required."),
  description: Yup.string(),
  openingTime: Yup.string().required("Opening time is required."),
  closingTime: Yup.string().required("Closing time is required."),
  buildingNo: Yup.string(),
  street: Yup.string(),
  barangay: Yup.string().required("Barangay is required."),
  municipality: Yup.string().required("Municipality is required."),
  province: Yup.string().required("Province is required."),
  postalCode: Yup.string().required("Postal code is required."),
});

const timeOptions = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
  "10:00 PM",
];

const getCroppedImg = async (imageSrc, crop, croppedAreaPixels) => {
  const image = new window.Image();
  image.src = imageSrc;
  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      canvas.toBlob((blob) => {
        if (!blob) {
          reject("Canvas is empty");
          return;
        }
        const fileURL = URL.createObjectURL(blob);
        resolve({ blob, fileURL });
      }, "image/jpeg");
    };
    image.onerror = (error) => {
      reject(error);
    };
  });
};

export default function ShopProfile() {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });

  const [shopLogo, setShopLogo] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const initialFormValues = {
    name: "",
    email: "",
    contactNo: "",
    description: "",
    openingTime: "",
    closingTime: "",
    buildingNo: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
    postalCode: "",
    googleMapPlaceName: "",
    latitude: "",
    longitude: "",
  };

  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: shopProfileSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("contactNo", values.contactNo);
        formData.append("description", values.description);
        formData.append("openingTime", values.openingTime);
        formData.append("closingTime", values.closingTime);
        formData.append("buildingNo", values.buildingNo);
        formData.append("street", values.street);
        formData.append("barangay", values.barangay);
        formData.append("municipality", values.municipality);
        formData.append("province", values.province);
        formData.append("postalCode", values.postalCode);
        formData.append("googleMapPlaceName", values.googleMapPlaceName);
        formData.append("latitude", values.latitude);
        formData.append("longitude", values.longitude);

        if (shopLogo && shopLogo.blob) {
          formData.append("logo", shopLogo.blob, "shop-logo.jpg");
        }

        const response = await fetch("/api/shops/edit-shop-info", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Failed to save changes, status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setShopData((prev) => ({
            ...prev,
            name: values.name,
            email: values.email,
            contactNo: values.contactNo,
            description: values.description,
            openingTime: values.openingTime,
            closingTime: values.closingTime,
            address: {
              buildingNo: values.buildingNo,
              street: values.street,
              barangay: values.barangay,
              municipality: values.municipality,
              province: values.province,
              postalCode: values.postalCode,
              googleMapLocation: {
                name: values.googleMapPlaceName,
                latitude: values.latitude,
                longitude: values.longitude,
              },
            },
            logo: shopLogo?.fileURL || prev.logo,
          }));
          setIsEditing(false);
          handleAlert("Shop profile has been updated successfully.", "success", "Success");
        } else {
          handleAlert("Shop profile update failed.", "failed", "Error");
        }
      } catch (error) {
        console.error("Error saving shop data:", error);
        handleAlert("Shop profile update failed.", "failed", "Error");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchShopData = async () => {
    try {
      const response = await fetch("/api/users/get-user-shop-info", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setShopData(data);
      setShopLogo(data.logo || "/images/placeholder-shop-logo.png");
      formik.setValues({
        name: data.name || "",
        email: data.email || "",
        contactNo: data.contactNo || "",
        description: data.description || "",
        openingTime: data.openingTime || "",
        closingTime: data.closingTime || "",
        buildingNo: data.address?.buildingNo || "",
        street: data.address?.street || "",
        barangay: data.address?.barangay || "",
        municipality: data.address?.municipality || "",
        province: data.address?.province || "",
        postalCode: data.address?.postalCode || "",
        googleMapPlaceName: data.address?.googleMapLocation?.name || "",
        latitude: data.address?.googleMapLocation?.latitude || "",
        longitude: data.address?.googleMapLocation?.longitude || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const handleLocationSelect = useCallback((coords, placeName) => {
    formik.setFieldValue("latitude", coords.lat);
    formik.setFieldValue("longitude", coords.lng);
    formik.setFieldValue("googleMapPlaceName", placeName || "None");
  }, [formik]);

  const initialMapPosition =
    formik.values.latitude !== "" && formik.values.longitude !== ""
      ? { lat: Number(formik.values.latitude), lng: Number(formik.values.longitude) }
      : null;

  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropConfirm = async () => {
    try {
      const { blob, fileURL } = await getCroppedImg(imageSrc, crop, croppedAreaPixels);
      setShopLogo({ blob, fileURL });
      setImageSrc(null);
      setIsCropDialogOpen(false);
    } catch (err) {
      console.error("Error cropping image:", err);
    }
  };

  const handleCropCancel = () => {
    setImageSrc(null);
    setIsCropDialogOpen(false);
  };

  const handleCancelEditing = () => {
    if (shopData) {
      formik.setValues({
        name: shopData.name || "",
        email: shopData.email || "",
        contactNo: shopData.contactNo || "",
        description: shopData.description || "",
        openingTime: shopData.openingTime || "",
        closingTime: shopData.closingTime || "",
        buildingNo: shopData.address?.buildingNo || "",
        street: shopData.address?.street || "",
        barangay: shopData.address?.barangay || "",
        municipality: shopData.address?.municipality || "",
        province: shopData.address?.province || "",
        postalCode: shopData.address?.postalCode || "",
        googleMapPlaceName: shopData.address?.googleMapLocation?.name || "",
        latitude: shopData.address?.googleMapLocation?.latitude || "",
        longitude: shopData.address?.googleMapLocation?.longitude || "",
      });
      setShopLogo(shopData.logo ? { fileURL: shopData.logo } : null);
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading shop profile..." />
      </DashboardLayoutWrapper>
    );
  }

  if (error) {
    return (
      <DashboardLayoutWrapper>
        <Alert className="flex flex-row items-center w-full shadow-lg rounded-lg p-4">
          <CircleAlert className="scale-[200%] h-[60%] stroke-red-500" />
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle className="text-lg font-bold text-red-500">Error</AlertTitle>
            <AlertDescription className="tracking-wide font-light text-red-300">
              {error}
            </AlertDescription>
          </div>
        </Alert>
      </DashboardLayoutWrapper>
    );
  }

  const { shopNo } = shopData;

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle className="text-lg font-bold text-green-500">
              {alert.title}
            </AlertTitle>
            <AlertDescription className="tracking-wide font-light text-green-300">
              {alert.message}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            className="ml-auto p-2"
            onClick={() => setAlert({ message: "", type: "", title: "" })}
          >
            <X className="scale-150 stroke-primary/50 -translate-x-2" />
          </Button>
        </Alert>
      )}

      <CardTitle className="text-4xl mb-5">Shop Profile</CardTitle>
      <div className="flex gap-5">
        <div className="flex flex-col gap-2 items-center">
          <Card className="bg-accent p-2">
            <Image
              src={shopLogo?.fileURL || shopLogo || "/images/placeholder-shop-logo.png"}
              alt="Shop Logo"
              objectFit="cover"
              width={300}
              height={300}
              quality={100}
              className="rounded-sm"
            />
          </Card>
          {isEditing && (
            <Button
              variant="outline"
              className="text-sm w-full border"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1" />
              Upload Shop Logo
            </Button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <Card className="flex-1 p-5 mb-20">
          <div className="flex justify-between items-center mb-5">
            <CardTitle className="text-2xl">Shop Information</CardTitle>
            {!isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 p-0"
              >
                <Pencil className="scale-125" />
              </Button>
            )}
          </div>
          <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-5">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="shopNo" className="font-bold">
                Shop No
              </Label>
              <Input id="shopNo" name="shopNo" type="text" value={shopNo || "N/A"} disabled />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="name" className="font-bold flex flex-row items-center">
                Name <Asterisk className="w-4" />
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter shop name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.name, formik.touched.name)}
              />
              {formik.touched.name && formik.errors.name && (
                <InputErrorMessage error={formik.errors.name} touched={formik.touched.name} />
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="description" className="font-bold">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter shop description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.description, formik.touched.description)}
              />
              {formik.touched.description && formik.errors.description && (
                <InputErrorMessage error={formik.errors.description} touched={formik.touched.description} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="contactNo" className="font-bold flex flex-row items-center">
                Contact No <Asterisk className="w-4" />
              </Label>
              <Input
                id="contactNo"
                name="contactNo"
                type="text"
                placeholder="Enter contact number"
                value={formik.values.contactNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.contactNo, formik.touched.contactNo)}
              />
              {formik.touched.contactNo && formik.errors.contactNo && (
                <InputErrorMessage error={formik.errors.contactNo} touched={formik.touched.contactNo} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="font-bold flex flex-row items-center">
                Email <Asterisk className="w-4" />
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.email, formik.touched.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <InputErrorMessage error={formik.errors.email} touched={formik.touched.email} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="openingTime" className="font-bold flex flex-row items-center">
                Opening Time <Asterisk className="w-4" />
              </Label>
              <Select
                aria-labelledby="openingTime"
                onValueChange={(value) => formik.setFieldValue("openingTime", value)}
                value={formik.values.openingTime || ""}
                disabled={!isEditing}
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
              {formik.touched.openingTime && formik.errors.openingTime && (
                <InputErrorMessage error={formik.errors.openingTime} touched={formik.touched.openingTime} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="closingTime" className="font-bold flex flex-row items-center">
                Closing Time <Asterisk className="w-4" />
              </Label>
              <Select
                aria-labelledby="closingTime"
                onValueChange={(value) => formik.setFieldValue("closingTime", value)}
                value={formik.values.closingTime || ""}
                disabled={!isEditing}
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
              {formik.touched.closingTime && formik.errors.closingTime && (
                <InputErrorMessage error={formik.errors.closingTime} touched={formik.touched.closingTime} />
              )}
            </div>

            <div className="col-span-2">
              <CardTitle className="text-2xl">Address Details</CardTitle>
            </div>
            {/* Building No Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="buildingNo" className="font-bold">
                Building No
              </Label>
              <Input
                id="buildingNo"
                name="buildingNo"
                type="text"
                placeholder="Enter building number"
                value={formik.values.buildingNo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.buildingNo, formik.touched.buildingNo)}
              />
            </div>
            {/* Street Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="street" className="font-bold">
                Street
              </Label>
              <Input
                id="street"
                name="street"
                type="text"
                placeholder="Enter street name"
                value={formik.values.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.street, formik.touched.street)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="barangay" className="font-bold flex flex-row items-center">
                Barangay <Asterisk className="w-4" />
              </Label>
              <Input
                id="barangay"
                name="barangay"
                type="text"
                placeholder="Enter barangay"
                value={formik.values.barangay}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.barangay, formik.touched.barangay)}
              />
              {formik.touched.barangay && formik.errors.barangay && (
                <InputErrorMessage error={formik.errors.barangay} touched={formik.touched.barangay} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="municipality" className="font-bold flex flex-row items-center">
                Municipality <Asterisk className="w-4" />
              </Label>
              <Input
                id="municipality"
                name="municipality"
                type="text"
                placeholder="Enter municipality"
                value={formik.values.municipality}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.municipality, formik.touched.municipality)}
              />
              {formik.touched.municipality && formik.errors.municipality && (
                <InputErrorMessage error={formik.errors.municipality} touched={formik.touched.municipality} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="province" className="font-bold flex flex-row items-center">
                Province <Asterisk className="w-4" />
              </Label>
              <Input
                id="province"
                name="province"
                type="text"
                placeholder="Enter province"
                value={formik.values.province}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.province, formik.touched.province)}
              />
              {formik.touched.province && formik.errors.province && (
                <InputErrorMessage error={formik.errors.province} touched={formik.touched.province} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="postalCode" className="font-bold flex flex-row items-center">
                Postal Code <Asterisk className="w-4" />
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="Enter postal code"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!isEditing}
                className={InputErrorStyle(formik.errors.postalCode, formik.touched.postalCode)}
              />
              {formik.touched.postalCode && formik.errors.postalCode && (
                <InputErrorMessage error={formik.errors.postalCode} touched={formik.touched.postalCode} />
              )}
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label className="font-bold flex flex-row items-center">
                {"Your Shop's Google Map Location"} <Asterisk className="w-4" />
              </Label>
              <MapPicker
                onLocationSelect={handleLocationSelect}
                disabled={!isEditing}
                initialPosition={initialMapPosition}
                initialPlaceName={formik.values.googleMapPlaceName}
              />
            </div>
            {isEditing && (
              <div className="col-span-2 flex flex-col gap-5 mt-5">
                <Button
                  type="submit"
                  variant="default"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {saving ? <Loader className="animate-spin" /> : null}
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleCancelEditing}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Card>
      </div>
      <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crop Your Shop Logo</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, croppedAreaPixels) => {
                  setCroppedAreaPixels(croppedAreaPixels);
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="default" onClick={handleCropConfirm}>
              Confirm
            </Button>
            <Button variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayoutWrapper>
  );
}
