import React, { useState, useEffect, useRef } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Upload } from "lucide-react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import Loading from "@/components/ui/loading";

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
        const file = new File([blob], "cropped-image.jpg", {
          type: "image/jpeg",
        });
        resolve(URL.createObjectURL(file));
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  useEffect(() => {
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
        setFormValues(data);
        setProfilePicture(data.profilePicture || "/images/placeholder-profile-picture.png");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFieldChange = (field, value) => {
    if (!isEditing) return;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setIsCropDialogOpen(true);
    }
  };

  const handleCropConfirm = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, crop, croppedAreaPixels);
      setProfilePicture(croppedImage);
      setImageSrc(null);
      setIsCropDialogOpen(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCropCancel = () => {
    setImageSrc(null);
    setIsCropDialogOpen(false);
  };

  const handleCancelEditing = () => {
    if (userData) {
      setFormValues(userData);
      setProfilePicture(userData.profilePicture || "/images/placeholder-profile-picture.png");
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
      <CardTitle className="text-4xl mb-5">Profile</CardTitle>
      <div className="flex gap-5">
        <div className="flex flex-col gap-2 items-center">
          <Card className="bg-accent p-2">
            <Image
              src={profilePicture}
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
              onClick={() => setIsEditing((prev) => !prev)}
              className="w-10 h-10 p-0"
              disabled={isEditing}
            >
              <Pencil className="scale-125" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label className="font-bold">User No</Label>
              <Input value={formValues.userNo || ""} disabled />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Username</Label>
              <Input
                value={formValues.username || ""}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange("username", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Email</Label>
              <Input
                value={formValues.email || ""}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">First Name</Label>
              <Input
                value={formValues.firstName || ""}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Last Name</Label>
              <Input
                value={formValues.lastName || ""}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="font-bold">Contact No</Label>
              <Input
                value={formValues.contactNo || ""}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange("contactNo", e.target.value)}
              />
            </div>
            {isEditing && (
              <div className="flex flex-col justify-end gap-2 mt-10">
                <Button variant="default" className="w-full">
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelEditing}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
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
