import { useSession } from "next-auth/react";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Loading...</div>; // Show a loading message or redirect if the user is not logged in
  }

  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">Dashboard</CardTitle>
      <Card>
        <h1>Admin Dashboard</h1>
        <h2>Session Information</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </Card>
    </DashboardLayoutWrapper>
  );
}
