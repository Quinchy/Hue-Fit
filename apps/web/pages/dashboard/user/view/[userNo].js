import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from '@/routes';
import Image from 'next/image';
import { MoveLeft } from 'lucide-react';

// Import the role-based components
import ViewAdminInfo from "../components/view-admin-info";
import ViewVendorInfo from "../components/view-vendor-info";
import ViewCustomerInfo from "../components/view-customer-info";

export default function UserProfilePage() {
  const router = useRouter();

  // Simulating the user data here. In actual implementation, replace this with data fetching or props.
  const user = {
    firstName: 'Carl Andrei',
    lastName: 'Tailorin',
    username: 'Shabu',
    status: 'Active',
    role: 'Admin', // Change this to "Vendor" or "Customer" to test other components
    dateCreated: 'October 15, 2024'
  };

  // Determine which component to render based on the user role
  const renderUserInfo = () => {
    switch (user.role) {
      case 'Admin':
        return <ViewAdminInfo user={user} />;
      case 'Vendor':
        return <ViewVendorInfo user={user} />;
      case 'Customer':
        return <ViewCustomerInfo user={user} />;
      default:
        return <p>Invalid role</p>;
    }
  };

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back to Users Button */}
      <div className="flex flex-col gap-10">
        <div className='flex flex-row justify-between'>
          <CardTitle className="text-4xl font-bold">User Profile</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.user)}>
            <MoveLeft className="scale-125" />
            Back to Users
          </Button>
        </div>

        {/* Profile Picture and User Information Section */}
        <div className='flex flex-row items-start gap-5'>
          {/* Profile Picture */}
          <div className="bg-accent rounded border-8 border-card">
            <Image src="/images/placeholder-profile-picture.png" alt="Profile" width={320} height={320} className='max-w-[30rem]'  />
          </div>

          {/* Conditionally Rendered User Information Section */}
          <div className="w-full">
            {renderUserInfo()}
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
