import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import routes from '@/routes';
import { Button } from "@/components/ui/button";
import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function ViewInquiry() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push(routes.inquiry);
  };
  return (
    <DashboardLayoutWrapper>
      {/* Header with Back Button */}
      <div className="flex flex-row justify-between items-center mb-5">
        <CardTitle className="text-4xl">Inquiry Detail</CardTitle>
        <Button variant="outline" onClick={handleGoBack} className="font-normal">
          <MoveLeft className="scale-125" />
          Back to Inquiries
        </Button>
      </div>

      {/* Inquiry Detail Card */}
      <Card className="flex flex-col gap-5 p-6 rounded-lg shadow-md">
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Email:</Label>
          Email
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Subject:</Label>
          Subject
        </div>
        <div className="flex flex-col gap-3">
          <Label className="font-bold">Message:</Label>
          Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla libero euismod at aptent blandit amet auctor. 
          Natoque varius posuere vehicula scelerisque pulvinar iaculis augue. Litora semper suspendisse porttitor 
          inceptos pellentesque venenatis tortor cras. Hendrerit interdum ipsum egestas sed suscipit cubilia. 
          Facilisis cubilia malesuada arcu eleifend sit. Mollis tortor dictum vel; tempor dignissim mus pulvinar sodales pretium.
          Ac dapibus vehicula fames venenatis ac.
          Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla libero euismod at aptent blandit amet auctor. 
          Natoque varius posuere vehicula scelerisque pulvinar iaculis augue. Litora semper suspendisse porttitor 
          inceptos pellentesque venenatis tortor cras. Hendrerit interdum ipsum egestas sed suscipit cubilia. 
          Facilisis cubilia malesuada arcu eleifend sit. Mollis tortor dictum vel; tempor dignissim mus pulvinar sodales pretium.
          Ac dapibus vehicula fames venenatis ac.
          Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla libero euismod at aptent blandit amet auctor. 
          Natoque varius posuere vehicula scelerisque pulvinar iaculis augue. Litora semper suspendisse porttitor 
          inceptos pellentesque venenatis tortor cras. Hendrerit interdum ipsum egestas sed suscipit cubilia. 
          Facilisis cubilia malesuada arcu eleifend sit. Mollis tortor dictum vel; tempor dignissim mus pulvinar sodales pretium.
          Ac dapibus vehicula fames venenatis ac.
          Lorem ipsum odor amet, consectetuer adipiscing elit. Nulla libero euismod at aptent blandit amet auctor. 
          Natoque varius posuere vehicula scelerisque pulvinar iaculis augue. Litora semper suspendisse porttitor 
          inceptos pellentesque venenatis tortor cras. Hendrerit interdum ipsum egestas sed suscipit cubilia. 
          Facilisis cubilia malesuada arcu eleifend sit. Mollis tortor dictum vel; tempor dignissim mus pulvinar sodales pretium.
          Ac dapibus vehicula fames venenatis ac.
        </div>
        <div className="flex flex-row gap-3 items-center">
          <Label className="font-bold">Date:</Label>
          Date
        </div>
      </Card>
    </DashboardLayoutWrapper>
  );
}
