// File: pages/dashboard/users/[userNo].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import routes from "@/routes";
import Image from "next/image";
import Loading from "@/components/ui/loading";

// Import role-based sub-components
import ViewAdminInfo from "../components/view-admin-info";
import ViewVendorInfo from "../components/view-vendor-info";
import ViewCustomerInfo from "../components/view-customer-info";

async function fetchUserInfo(userNo) {
  const response = await fetch(`/api/users/get-user-info?userNo=${userNo}`);
  if (!response.ok) throw new Error("Error fetching user info");
  return response.json();
}

export default function UsersDetailPage() {
  const router = useRouter();
  const { userNo } = router.query;
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userNo) {
      (async () => {
        try {
          setLoading(true);
          const data = await fetchUserInfo(userNo);
          setUserData(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [userNo]);

  const renderUserInfo = () => {
    if (!userData) return null;
    switch (userData.role) {
      case "ADMIN":
        // Show Admin profile details
        return <ViewAdminInfo user={userData} />;
      case "VENDOR":
        // Show Vendor profile details along with shop name
        return <ViewVendorInfo user={userData} />;
      case "CUSTOMER":
        // Show Customer profile, features, and addresses
        return <ViewCustomerInfo user={userData} />;
      default:
        return <p>Invalid role</p>;
    }
  };

  if (loading) {
    return (
      <DashboardLayoutWrapper>
        <Loading message="Loading user details..." />
      </DashboardLayoutWrapper>
    );
  }

  if (!userData) {
    return (
      <DashboardLayoutWrapper>
        <div className="flex justify-center items-center h-full">
          User not found.
        </div>
      </DashboardLayoutWrapper>
    );
  }

  return (
    <DashboardLayoutWrapper>
      <div className="flex flex-col gap-10">
        <div className="flex flex-row justify-between">
          <CardTitle className="text-4xl font-bold">User Profile</CardTitle>
          <Button variant="outline" onClick={() => router.push(routes.user)}>
            <MoveLeft className="scale-125" />
            Back to Users
          </Button>
        </div>

        <div className="flex flex-row items-start gap-5">
          <div className="bg-accent rounded border-8 border-card">
            <Image
              src={userData.profilePicture || "/images/placeholder-profile-picture.png"}
              alt="Profile"
              width={320}
              height={320}
              className="max-w-[30rem]"
            />
          </div>
          <div className="w-full flex flex-col gap-5">
            <Card className="p-5">
              <CardTitle className="text-xl font-semibold mb-4">General Information</CardTitle>
              <div className="space-y-1">
                <p className="font-thin"><strong>User No:</strong> {userData.userNo}</p>
                <p className="font-thin"><strong>Username:</strong> {userData.username}</p>
                <p className="font-thin"><strong>Role:</strong> {userData.role}</p>
              </div>
            </Card>
            {renderUserInfo()}
          </div>
        </div>
      </div>
    </DashboardLayoutWrapper>
  );
}
