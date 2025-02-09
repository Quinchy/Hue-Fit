import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from "@/routes";
import Image from "next/image";
import { MoveLeft, Pencil } from "lucide-react";
import Loading from "@/components/ui/loading";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Import role-based sub-components (only Vendor and Customer are editable)
import EditVendorForm from "../components/edit-vendor-form";
import EditCustomerForm from "../components/edit-customer-form";

// For image cropping
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Helper to crop the image.
const getCroppedImg = async (imageSrc, crop, croppedAreaPixels) => {
  const image = new Image();
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
  const { userNo } = router.query;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Profile Picture States ---
  // Initialize with a placeholder image.
  const [profilePicture, setProfilePicture] = useState("/images/placeholder-profile-picture.png");
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  // Mimic the view page's async data fetch pattern.
  useEffect(() => {
    if (userNo) {
      (async () => {
        try {
          const res = await fetch(`/api/users/get-user-info?userNo=${userNo}`);
          if (!res.ok) throw new Error("Error fetching user info");
          const data = await res.json();

          // Set the form state with all necessary fields.
          // For vendors, we include shop, contactNo, and position.
          // For customers, we include addresses and features.
          setForm({
            role: data.role || "VENDOR",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            username: data.username || "",
            password: "", // Always keep password empty for security reasons.
            email: data.email || "",
            profilePicture: data.profilePicture || "/images/placeholder-profile-picture.png",
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

          // If a profile picture exists, update the state.
          if (data.profilePicture) {
            setProfilePicture(data.profilePicture);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [userNo]);

  // Handle changes to fields that affect the parent form state.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Role change from the Select component.
  // (Even though the select is disabled, this handler remains for consistency.)
  const handleRoleChange = (value) => {
    setForm((prevForm) => ({ ...prevForm, role: value }));
  };

  // --- Profile Picture Handlers ---
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
      setProfilePicture(fileURL);
      // Update form state with the new picture.
      setForm((prev) => ({ ...prev, profilePicture: fileURL }));
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

  if (loading || !form) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading user details..." />
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back to Users Button */}
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-4xl">Edit User</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          <MoveLeft className="scale-125" />
          Back to Users
        </Button>
      </div>
      <div className="flex gap-6">
        {/* Profile Picture Section with integrated editing */}
        <div className="flex flex-col items-center gap-5">
          <div className="bg-accent rounded border-8 border-card">
            <Image 
              src={profilePicture} 
              alt="Profile" 
              width={320} 
              height={320} 
              className="max-w-[30rem]" 
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Pencil className="scale-110 stroke-[3px] mr-2" />
            Edit Picture
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Form Section */}
        <div className="w-3/4 space-y-6 mb-20">
          {/* Role Information */}
          <Card className="p-4">
            <CardTitle className="text-2xl">Role Information</CardTitle>
            <Select name="role" value={form.role} onValueChange={handleRoleChange} disabled>
              <SelectTrigger className="w-full p-2 mt-2 border rounded">
                <SelectValue placeholder="Set a role" />
              </SelectTrigger>
              <SelectContent>
                {/* Only Vendor and Customer roles are available */}
                <SelectItem value="VENDOR">Vendor</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Conditional Form Rendering based on role */}
          {form.role === "VENDOR" && (
            <EditVendorForm form={form} onChange={handleChange} />
          )}
          {form.role === "CUSTOMER" && (
            <EditCustomerForm form={form} onChange={handleChange} />
          )}
        </div>
      </div>

      {/* Crop Dialog for Profile Picture */}
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
