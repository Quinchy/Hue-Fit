import { Card, CardTitle } from "@/components/ui/card";
import WebsiteLayoutWrapper from "@/components/ui/website-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import MapPicker from "@/components/ui/map-picker";
import Footer from "@/components/ui/footer";
import { useState } from "react";

export default function Partnership() {
  const [location, setLocation] = useState(null);

  const handleLocationSelect = (coords) => {
    setLocation(coords); // Store latitude and longitude in state
  };
  return (
    <WebsiteLayoutWrapper>
      <div className="flex flex-col items-center gap-3">
        <CardTitle className="text-8xl text-center font-black"> Innovate Through <br></br> AI-OUTFIT Generation </CardTitle>
        <CardTitle className="text-2xl text-primary/80 font-base"> Join us in revolutionizing men's fashion, one recommendation at a time. </CardTitle>
      </div>
      <Card className="mb-40 mx-96">
        <form action="" className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <CardTitle className="text-2xl">Contact Person Informaton</CardTitle>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <Label htmlFor="firstname">First Name</Label>
                <Input placeholder="Enter your first name"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="lastname">Last Name</Label>
                <Input placeholder="Enter your last name"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="contactnumber">Contact Number</Label>
                <Input placeholder="Enter your contact number"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="email">Email</Label>
                <Input placeholder="Enter your email"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="position">Position</Label>
                <Input placeholder="Enter your position"/>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="businesslocation">Business License</Label>
                <FileUpload onFileSelect={(file) => console.log("Selected file:", file)} maxSizeMB={20} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <CardTitle className="text-2xl">Shop Informaton</CardTitle>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between gap-5">
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="shopname">Shop Name</Label>
                    <Input placeholder="Enter the shop name"/>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="shopcontactnumber">Shop Contact Number</Label>
                    <Input placeholder="Enter the shop contact number"/>
                  </div>
                </div>
                <div className="flex flex-row w-full gap-5">
                  <div className="flex flex-col w-full gap-5">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="buildingnumber">Building Number</Label>
                      <Input placeholder="Enter the building number"/>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="barangay">Barangay</Label>
                      <Input placeholder="Enter the barangay"/>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="municipality">Municipality</Label>
                      <Input placeholder="Enter the municipality"/>
                    </div>
                  </div>
                  <div className="flex flex-col w-full gap-5">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="street">Street</Label>
                      <Input placeholder="Enter the street"/>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="postalnumber">Postal Number</Label>
                      <Input placeholder="Enter the postal  number"/>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="province">Province</Label>
                      <Input placeholder="Enter the province"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="location">Map Location</Label>
                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  center={location || { lat: 14.5995, lng: 120.9842 }} // Default to Manila
                />
                {location && (
                  <p className="text-center">
                    Selected Location: {location.lat}, {location.lng}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Button>Submit</Button>
        </form>
      </Card>
      <Footer/>
    </WebsiteLayoutWrapper>
  );
}
  