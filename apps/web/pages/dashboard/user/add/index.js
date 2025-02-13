// File: pages/admin/add-admin.js
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoveLeft } from 'lucide-react';
import routes from '@/routes';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { InputErrorMessage, InputErrorStyle, ErrorMessage } from "@/components/ui/error-message";

// Helper function for cropping image (copied from profile.js)
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

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  // email, contact, and profilePicture are optional
});

export default function AddAdminPage() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    username: '',
    password: '',
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

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setGeneralError('');
    try {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('contact', values.contact);
      formData.append('username', values.username);
      formData.append('password', values.password);
      // Force roleId to 1 for admin
      formData.append('roleId', '1');
      if (profilePicture && profilePicture.blob) {
        formData.append('profilePicture', profilePicture.blob, "profile.jpg");
      }
      const res = await fetch('/api/users/create-admin-user', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setGeneralError(data.error || 'An error occurred');
      } else {
        resetForm();
        router.push(routes.user);
      }
    } catch (err) {
      console.error(err);
      setGeneralError('An error occurred while creating admin');
    }
    setSubmitting(false);
  };

  return (
    <DashboardLayoutWrapper>
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-4xl">Create Admin</CardTitle>
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          <MoveLeft className="scale-125" />
          Back to Users
        </Button>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, handleChange, handleSubmit, touched, errors, isSubmitting }) => (
          <Form onSubmit={handleSubmit} className="flex gap-6">
            {/* Left Column: Profile Picture */}
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
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Plus className="scale-110 stroke-[3px] mr-2" />
                Upload Profile Picture
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {/* Right Column: Admin Information */}
            <div className="w-3/4 space-y-6 mb-20">
              <Card className="p-6">
                <CardTitle className="text-2xl mb-4">Admin Information</CardTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter the admin's first name"
                      value={values.firstName}
                      onChange={handleChange}
                      className={InputErrorStyle(errors.firstName, touched.firstName)}
                    />
                    <InputErrorMessage error={errors.firstName} touched={touched.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter the admin's last name"
                      value={values.lastName}
                      onChange={handleChange}
                      className={InputErrorStyle(errors.lastName, touched.lastName)}
                    />
                    <InputErrorMessage error={errors.lastName} touched={touched.lastName} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="Enter the admin's email"
                      value={values.email}
                      onChange={handleChange}
                      className="border-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact No.</Label>
                    <Input
                      id="contact"
                      name="contact"
                      placeholder="Enter the admin's contact number"
                      value={values.contact}
                      onChange={handleChange}
                      className="border-2"
                    />
                  </div>
                </div>
                <CardTitle className="text-2xl my-6">Admin Account</CardTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Create the admin's username"
                      value={values.username}
                      onChange={handleChange}
                      className={InputErrorStyle(errors.username, touched.username)}
                    />
                    <InputErrorMessage error={errors.username} touched={touched.username} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create the admin's password"
                      value={values.password}
                      onChange={handleChange}
                      className={InputErrorStyle(errors.password, touched.password)}
                    />
                    <InputErrorMessage error={errors.password} touched={touched.password} />
                  </div>
                </div>
              </Card>
              {generalError && <ErrorMessage message={generalError} />}
              <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>

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
