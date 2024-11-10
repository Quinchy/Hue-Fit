import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MapView from '@/components/ui/map-view';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoveLeft } from 'lucide-react';
import formatDate from '@/utils/date-helpers';
import routes from '@/routes';
import BusinessLicense from '@/components/ui/business-license';

export default function ManageShopRequest() {
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState(""); // Initialize with empty status for Select
  const router = useRouter();
  const { requestNo } = router.query;

  useEffect(() => {
    if (requestNo) {
      const fetchRequest = async () => {
        try {
          const response = await fetch(`/api/shop-requests/get-manage-shop-request?requestNo=${requestNo}`);
          const data = await response.json();
          setRequest(data);
          setStatus(data.status); // Set initial status for Select
        } catch (error) {
          console.error("Error fetching request data:", error);
        }
      };

      fetchRequest();
    }
  }, [requestNo]);

  if (!request) {
    return <p>Request not found</p>;
  }

  const handleGoBack = () => {
    router.push(routes.shopRequest); // Redirect to the shop requests list page
  };

  const handleStatusChange = (value) => {
    setStatus(value); // Update status on selection change
  };

  const handleSubmit = () => {
    // Logic to handle submission based on status
    if (status === "TERMINATE") {
      console.log("Terminate request submitted");
      // Add logic to handle terminate request submission here
    } else if (status === "ACTIVE") {
      console.log("Activate request submitted with username and password:", username, password);
      // Add logic to handle account creation submission here
    }
  };

  return (
    <DashboardLayoutWrapper>
      <div className='flex flex-row items-center justify-between'>
        <div className='flex flex-row gap-2 items-center'>
          <CardTitle className="text-4xl">Request Number:</CardTitle>
          <p className='text-3xl font-bold'>{request.requestNo}</p>
        </div>
        <Button variant="outline" onClick={handleGoBack} className="font-normal">
          <MoveLeft className="scale-125" />
          Back to Shop Requests
        </Button>
      </div>
      <Card className="flex flex-col gap-10 mt-5 mb-20">
        <div className='flex flex-row justify-between mb-5'>
          <div className="flex flex-col">
            <div className="flex flex-row gap-2 items-center">
              <CardTitle className="text-2xl">Date Created:</CardTitle>
              <p>{formatDate(request.created_at)}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <CardTitle className="text-2xl">Last Update:</CardTitle>
              <p>{formatDate(request.updated_at)}</p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-5'>
        <CardTitle className="text-2xl">Shop Information</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Shop Name</Label>
              <Input readOnly value={request.shopName} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Shop Contact Number</Label>
              <Input readOnly value={request.shopContactNo} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Building Number</Label>
              <Input readOnly value={request.buildingNo || 'N/A'} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Street</Label>
              <Input readOnly value={request.street || 'N/A'} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Barangay</Label>
              <Input readOnly value={request.barangay} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Municipality</Label>
              <Input readOnly value={request.municipality} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Province</Label>
              <Input readOnly value={request.province} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Postal Number</Label>
              <Input readOnly value={request.postalNumber} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input readOnly value={request.longitude || 'N/A'} className="cursor-default" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input readOnly value={request.latitude || 'N/A'} className="cursor-default" />
            </div>
          </div> 
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl">Location on Map</CardTitle>
            <MapView latitude={request.latitude} longitude={request.longitude} />
            <div className="flex flex-col gap-2 mt-4">
              <Label>Google Map Place Name</Label>
              <Input readOnly value={request.googleMapPlaceName || 'N/A'} className="cursor-default" />
            </div>
          </div>
        </div>
        <div className="grid w-full items-center gap-4">
          <div className='flex flex-col gap-5'>
            <CardTitle className="text-2xl">Contact Person</CardTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>First Name</Label>
                <Input readOnly value={request.firstName} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Last Name</Label>
                <Input readOnly value={request.lastName} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Contact Number</Label>
                <Input readOnly value={request.contactNo} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input readOnly value={request.email} className="cursor-default" />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Position</Label>
                <Input readOnly value={request.position} className="cursor-default" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Label>Business License URL</Label>
            {request.businessLicense ? (
              <BusinessLicense imageUrl={request.businessLicense} />
            ) : (
              <p>N/A</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {status === "REJECTED" && (
              <Button onClick={handleSubmit} className="mt-10">
                Submit
              </Button>
            )}

            {status === "ACTIVE" && (
              <div className="flex flex-col gap-4 mt-6">
                <CardTitle className="text-2xl">Create Vendor Account</CardTitle>
                <div className="flex flex-col gap-2">
                  <Label>Username</Label>
                  <Input 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter username" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter password" 
                  />
                </div>
                <Button onClick={handleSubmit} className="mt-10">
                  Submit
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
