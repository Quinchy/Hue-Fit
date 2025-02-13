// File: pages/dashboard/users/edit-user.js
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from "@/routes";
import Image from "next/image";
import { MoveLeft, Plus, X, CircleCheck, CircleAlert } from "lucide-react";
import Loading from "@/components/ui/loading";
import { LoadingMessage } from "@/components/ui/loading-message";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import EditVendorForm from "../components/edit-vendor-form";
import EditCustomerForm from "../components/edit-customer-form";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

export default function EditUserPage() {
  const router = useRouter();
  const { userNo, userId: queryUserId } = router.query;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", title: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userNo) {
      (async () => {
        try {
          const res = await fetch(`/api/users/get-user-info?userNo=${userNo}`);
          if (!res.ok) throw new Error("Error fetching user info");
          const data = await res.json();
          const fetchedUserId = data.id || queryUserId;
          setForm({
            userId: Number(fetchedUserId),
            userNo: data.userNo,
            role: data.role || "VENDOR",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            password: "",
            email: data.email || "",
            contactNo: data.contactNo || "",
            ...(data.role === "CUSTOMER" && {
              addresses: data.addresses || [],
              features: data.features || [],
            }),
            ...(data.role === "VENDOR" && {
              shop: data.shop?.shopNo || "",
              contactNo: data.contactNo || "",
              position: data.position || "",
            }),
          });
          if (data.profilePicture) {
            setProfilePicture({ fileURL: data.profilePicture });
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [userNo, queryUserId]);

  const handleChildFormUpdate = (updatedValues) => {
    setForm((prev) => ({ ...prev, ...updatedValues }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
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
      const { blob, fileURL } = await getCroppedImg(
        imageSrc,
        crop,
        croppedAreaPixels
      );
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("userId", String(form.userId));
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("contactNo", form.contactNo);
    if (form.role === "VENDOR") {
      formData.append("shop", form.shop);
      formData.append("position", form.position);
    } else if (form.role === "CUSTOMER") {
      formData.append("address", JSON.stringify(form.addresses ? form.addresses[0] : {}));
      formData.append("features", JSON.stringify(form.features ? form.features[0] : {}));
    }
    if (profilePicture && profilePicture.blob) {
      formData.append("profilePicture", profilePicture.blob, "profile.jpg");
    }

    try {
      const res = await fetch("/api/users/edit-user-info", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setAlert({ message: "User profile updated successfully!", type: "success", title: "Success" });
      } else {
        setAlert({ message: "Failed to update user info.", type: "failed", title: "Error" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlert({ message: "Failed to update user info.", type: "failed", title: "Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !form) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading user details..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {alert.message && (
        <Alert className="flex flex-row items-center fixed z-50 w-[30rem] right-14 bottom-12 shadow-lg rounded-lg p-4">
          {alert.type === "success" ? (
            <CircleCheck className="ml-4 scale-[200%] h-[60%] stroke-green-500" />
          ) : (
            <CircleAlert className="ml-4 scale-[200%] h-[60%] stroke-red-500" />
          )}
          <div className="flex flex-col justify-center ml-10">
            <AlertTitle className={`text-lg font-bold ${alert.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {alert.title}
            </AlertTitle>
            <AlertDescription className={`tracking-wide font-light ${alert.type === "success" ? "text-green-300" : "text-red-300"}`}>
              {alert.message}
            </AlertDescription>
          </div>
          <Button variant="ghost" className="ml-auto p-2" onClick={() => setAlert({ message: "", type: "", title: "" })}>
            <X className="scale-150 stroke-primary/50 -translate-x-2" />
          </Button>
        </Alert>
      )}
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-4xl">Edit User</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          <MoveLeft className="scale-125" />
          Back to Users
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-5">
          <div className="bg-accent rounded border-8 border-card">
            {profilePicture ? (
              <Image
                src={profilePicture.fileURL}
                alt="Profile Picture"
                width={320}
                height={320}
                className="max-w-[30rem] object-cover"
              />
            ) : (
              <Image
                src="/images/placeholder-profile-picture.png"
                alt="Profile Picture"
                width={320}
                height={320}
                className="max-w-[30rem]"
              />
            )}
          </div>
          <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} type="button">
            <Plus className="scale-110 stroke-[3px] mr-2" />
            Upload Profile Picture
          </Button>
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        <div className="w-3/4 space-y-6 mb-20">
          <Card className="p-4">
            <CardTitle className="text-2xl">Role Information</CardTitle>
            <Select name="role" value={form.role} onValueChange={handleRoleChange} disabled>
              <SelectTrigger className="w-full p-2 mt-2 border rounded">
                <SelectValue placeholder="Set a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VENDOR">Vendor</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </Card>
          {form.role === "VENDOR" ? (
            <EditVendorForm form={form} onChange={handleChildFormUpdate} />
          ) : (
            <EditCustomerForm form={form} onChange={handleChildFormUpdate} />
          )}
          <Button className="mt-6 w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <LoadingMessage message="Saving Changes..." /> : "Save Changes"}
          </Button>
        </div>
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
                onCropComplete={(croppedArea, croppedAreaPixels) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
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
