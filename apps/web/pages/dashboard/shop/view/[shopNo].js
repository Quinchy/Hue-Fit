import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from 'lucide-react';
import routes from '@/routes';
import router from 'next/router';
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import MapView from '@/components/ui/map-view';
import BusinessLicense from '@/components/ui/business-license';

export default function ViewShop() {
  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className='flex flex-row justify-between'>
          <CardTitle className="text-4xl font-bold">Shop Information</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.shop)}>
            <MoveLeft className="scale-125" />
            Back to Shops
          </Button>
        </div>
        <div className="flex flex-row items-start gap-5">
          <div className="bg-accent rounded border-8 border-card">
            <Image src="/images/placeholder-picture.png" alt="Profile" width={320} height={320} className='max-w-[30rem]' />
          </div>
          <Card className="w-full">
            <div className="flex flex-col gap-5">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Shop Information:</CardTitle>
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Shop Number:</Label>
                      Shop Number
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Name:</Label>
                      Name
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Shop Contact Number:</Label>
                      Shop Contact Number
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Status:</Label>
                      Status
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <CardTitle className="text-2xl">Contact Person Information:</CardTitle>
                  <div className="flex flex-col">
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">First Name:</Label>
                      First Name
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Last Name:</Label>
                      Last Name
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Contact Number:</Label>
                      Contact Number
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Email:</Label>
                      Email
                    </div>
                    <div className="flex flex-row gap-3 items-center">
                      <Label className="font-bold">Position:</Label>
                      Position
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-bold">Description:</Label>
                Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla libero euismod at aptent blandit amet auctor. 
                Natoque varius posuere vehicula scelerisque pulvinar iaculis augue. Litora semper suspendisse porttitor 
                inceptos pellentesque venenatis tortor cras. Hendrerit interdum ipsum egestas sed suscipit cubilia. 
                Facilisis cubilia malesuada arcu eleifend sit. Mollis tortor dictum vel; tempor dignissim mus pulvinar sodales pretium.
                Ac dapibus vehicula fames venenatis ac.
              </div>
            </div>
          </Card>
        </div>
        <Card className="w-full">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-3 w-full">
              <CardTitle className="text-2xl">Shop Address Information:</CardTitle>
              <div className="flex flex-col">
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Building Number:</Label>
                  Building Number
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Street:</Label>
                  Street
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Barangay:</Label>
                  Barangay
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Municipality:</Label>
                  Municipality
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Province:</Label>
                  Province
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Postal Number:</Label>
                  Postal Number
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Google Map Name:</Label>
                  Google Map Name
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Latitude:</Label>
                  Latitude
                </div>
                <div className="flex flex-row gap-3 items-center">
                  <Label className="font-bold">Longitude:</Label>
                  Longitude
                </div>
                <div className="mt-1 flex flex-col gap-3 items-start">
                  <Label className="font-bold">Business License:</Label>
                  <BusinessLicense imageUrl={"/images/placeholder-picture.png"} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <CardTitle className="text-2xl">Location in Google Map:</CardTitle>
              <div>
                <MapView latitude={16.4023} longitude={120.596} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayoutWrapper>
  );
}