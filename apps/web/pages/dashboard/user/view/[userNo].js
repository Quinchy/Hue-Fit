import { useRouter } from 'next/router';
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import routes from '@/routes';
import Image from 'next/image';

export default function UserProfilePage() {
  const router = useRouter();

  const user = {
    firstName: 'Carl Andrei',
    lastName: 'Tailorin',
    username: 'Shabu',
    status: 'Active',
    role: 'Admin',
    dateCreated: 'October 15, 2024'
  };

  return (
    <DashboardLayoutWrapper>
      {/* Header with Back to Users Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">User Profile</h1>
        <Button variant="outline" onClick={() => router.push(routes.user)}>
          ← Back to Users
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Profile Picture Section */}
        <div className="w-1/4 flex flex-col items-center">
          <Image src="/images/profile-picture.png" alt="Profile" width={60} height={60} className="rounded-full" />
        </div>

        {/* User Information Section */}
        <div className="w-3/4">
          <Card className="p-6 shadow-md">
            <CardTitle className="text-xl font-semibold mb-4">User Information</CardTitle>
            <div className="space-y-3 text-gray-800">
              <p><strong>First Name:</strong> {user.firstName}</p>
              <p><strong>Last Name:</strong> {user.lastName}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Status:</strong> {user.status}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Date Created:</strong> {user.dateCreated}</p>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
