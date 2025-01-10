// File: /pages/profile/index.js
import React, { useState, useEffect, useRef } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Upload, Loader } from "lucide-react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFormik } from "formik";
import { editUserSchema } from "@/utils/validation-schema";
import Loading from "@/components/ui/loading";

// For the alert styling
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { X, CircleCheck, CircleAlert } from "lucide-react";

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

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  // Alert states
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/users/get-user-info", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUserData(data);
      setProfilePicture(data.profilePicture || "/images/placeholder-profile-picture.png");
      formik.setValues({
        username: data.username || "",
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        contactNo: data.contactNo || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      contactNo: "",
    },
    validationSchema: editUserSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("email", values.email);
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("contactNo", values.contactNo);

        // If a new profile picture was selected
        if (profilePicture?.blob) {
          formData.append("profilePicture", profilePicture.blob, "profile.jpg");
        }

        const response = await fetch("/api/users/edit-user-info", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Failed to save changes, status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setUserData((prev) => ({
            ...prev,
            ...values,
            profilePicture: profilePicture?.fileURL || prev.profilePicture,
          }));
          setIsEditing(false);
          handleAlert("User Profile has been updated successfully.", "success", "Success");
        } else {
          handleAlert("User Profile update failed.", "failed", "Error");
        }
      } catch (error) {
        console.error("Error saving user data:", error);
        handleAlert("User Profile update failed.", "failed", "Error");
      } finally {
        setSaving(false);
      }
    },
  });

  // Show or hide alert
  const handleAlert = (message, type, title) => {
    setAlert({ message, type, title });
    setTimeout(() => setAlert({ message: "", type: "", title: "" }), 5000);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
      setProfilePicture({ blob, fileURL });
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
    if (userData) {
      formik.setValues({
        username: userData.username || "",
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        contactNo: userData.contactNo || "",
      });
      setProfilePicture(
        userData.profilePicture
          ? { fileURL: userData.profilePicture }
          : null
      );
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading profile..." />
      </DashboardLayoutWrapper>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <DashboardLayoutWrapper>
      {/* ALERT */}
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          ) : (
            <CircleAlert className="ml-4 scale-[200%] h-[60%] stroke-red-500" />
          )}
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle
              className={`text-lg font-bold ${
                alert.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {alert.title}
            </AlertTitle>
            <AlertDescription
              className={`tracking-wide font-light ${
                alert.type === "success" ? "text-green-300" : "text-red-300"
              }`}
            >
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

      <CardTitle className="text-4xl mb-5">Profile</CardTitle>
      <div className="flex gap-5">
        <div className="flex flex-col gap-2 items-center">
          <Card className="bg-accent p-2">
            <Image
              src={
                profilePicture?.fileURL ||
                profilePicture ||
                "/images/placeholder-profile-picture.png"
              }
              alt="Profile Picture"
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
              Upload Profile Picture
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

        <Card className="flex-1 p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 p-0"
              disabled={isEditing}
            >
              <Pencil className="scale-125" />
            </Button>
          </div>

          <p className="text-base font-semibold">
            User No: {userData?.userNo || "N/A"}
          </p>
          <p className="text-base font-semibold">
            Role: {userData?.role || "N/A"}
          </p>
          {userData?.position && (
            <p className="text-base font-semibold">Position: {userData.position}</p>
          )}

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 mt-5">
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Username</Label>
              <Input
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                disabled={!isEditing}
                className={
                  formik.touched.username && formik.errors.username ? "border-red-500" : ""
                }
              />
              {formik.touched.username && formik.errors.username && (
                <span className="text-red-500 text-sm">{formik.errors.username}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Email</Label>
              <Input
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                disabled={!isEditing}
                className={
                  formik.touched.email && formik.errors.email ? "border-red-500" : ""
                }
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-500 text-sm">{formik.errors.email}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">First Name</Label>
              <Input
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                disabled={!isEditing}
                className={
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-red-500"
                    : ""
                }
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <span className="text-red-500 text-sm">{formik.errors.firstName}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Last Name</Label>
              <Input
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                disabled={!isEditing}
                className={
                  formik.touched.lastName && formik.errors.lastName ? "border-red-500" : ""
                }
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <span className="text-red-500 text-sm">{formik.errors.lastName}</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Contact No</Label>
              <Input
                name="contactNo"
                value={formik.values.contactNo}
                onChange={formik.handleChange}
                disabled={!isEditing}
                className={
                  formik.touched.contactNo && formik.errors.contactNo ? "border-red-500" : ""
                }
              />
              {formik.touched.contactNo && formik.errors.contactNo && (
                <span className="text-red-500 text-sm">{formik.errors.contactNo}</span>
              )}
            </div>

            {isEditing && (
              <div className="flex flex-col justify-end gap-2 mt-10">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={saving}
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
            <DialogTitle>Crop Your Profile Picture</DialogTitle>
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
