import { useState, useEffect } from "react";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MapPicker from "@/components/ui/map-picker";
import FileUpload from '@/components/ui/file-upload';
import { MoveLeft, Plus } from 'lucide-react';
import routes from '@/routes';
import router from 'next/router';
import Image from 'next/image';

export default function EditShop({ shopNo }) {
  const [shopData, setShopData] = useState(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await fetch(`/api/shops/get-shop-details?shopNo=${shopNo}`);
        const data = await response.json();
        setShopData(data);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      }
    };

    fetchShopData();
  }, [shopNo]);

  if (!shopData) return <p>Loading...</p>;

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className="flex flex-row justify-between">
          <CardTitle className="text-4xl font-bold">Edit Shop Information</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.shop)}>
            <MoveLeft className="scale-125" />
            Back to Shops
          </Button>
        </div>
        
        <div className="flex flex-row items-start gap-5">
          {/* Shop Image */}
          <div className="flex flex-col items-center gap-5">
            <div className="bg-accent rounded border-8 border-card">
              <Image
                src={shopData.logo || "/images/placeholder-picture.png"}
                alt="Profile"
                width={320}
                height={320}
                className="max-w-[30rem]"
              />
            </div>
            <Button variant="outline" className="w-full">
              <Plus className="scale-110 stroke-[3px] mr-2" />
              Add Picture
            </Button>
          </div>

          {/* Shop Information Form */}
          <Card className="w-full p-6">
            <div className="flex flex-col gap-5">
              <CardTitle className="text-2xl">Shop Information:</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Shop Number</Label>
                  <Input placeholder="Shop Number" defaultValue={shopData.shopNo} />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input placeholder="Name" defaultValue={shopData.name} />
                </div>
                <div>
                  <Label>Shop Contact Number</Label>
                  <Input placeholder="Shop Contact Number" defaultValue={shopData.contactNo} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Input placeholder="Status" defaultValue={shopData.status} />
                </div>
              </div>

              <CardTitle className="text-2xl mt-6">Contact Person Information:</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input placeholder="First Name" defaultValue={shopData.contactPerson?.firstName || ""} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input placeholder="Last Name" defaultValue={shopData.contactPerson?.lastName || ""} />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input placeholder="Contact Number" defaultValue={shopData.contactPerson?.contactNo || ""} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="Email" defaultValue={shopData.contactPerson?.email || ""} />
                </div>
                <div className="col-span-2">
                  <Label>Position</Label>
                  <Input placeholder="Position" defaultValue={shopData.contactPerson?.position || ""} />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-6">
                <Label className="font-bold">Description:</Label>
                <Input as="textarea" placeholder="Description" defaultValue={shopData.description} rows={4} />
              </div>
            </div>
          </Card>
        </div>

        {/* Address and Map Section */}
        <Card className="w-full p-6">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-5 w-full">
              <CardTitle className="text-2xl">Shop Address Information:</CardTitle>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Building Number</Label>
                  <Input placeholder="Building Number" defaultValue={shopData.buildingNo} />
                </div>
                <div>
                  <Label>Street</Label>
                  <Input placeholder="Street" defaultValue={shopData.street} />
                </div>
                <div>
                  <Label>Barangay</Label>
                  <Input placeholder="Barangay" defaultValue={shopData.barangay} />
                </div>
                <div>
                  <Label>Municipality</Label>
                  <Input placeholder="Municipality" defaultValue={shopData.municipality} />
                </div>
                <div>
                  <Label>Province</Label>
                  <Input placeholder="Province" defaultValue={shopData.province} />
                </div>
                <div>
                  <Label>Postal Number</Label>
                  <Input placeholder="Postal Number" defaultValue={shopData.postalNumber} />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label>Business License:</Label>
                  <FileUpload className="w-full mt-20" maxSizeMB={20} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Google Map Location:</Label>
                  <MapPicker
                    initialPosition={{
                      lat: shopData.latitude,
                      lng: shopData.longitude,
                    }}
                    placeName={shopData.googleMapPlaceName}
                  />
                </div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-row gap-2 items-center">
                    <Label>Google Map Name:</Label>
                    {shopData.googleMapPlaceName}
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <Label>Latitude:</Label>
                    {shopData.latitude}
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <Label>Longitude:</Label>
                    {shopData.longitude}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button className="mt-6 w-full mb-20">Submit</Button>
      </div>
    </DashboardLayoutWrapper>
  );
}
