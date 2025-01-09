// File: "@/components/ui/dashboard/admin.js"
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">Dashboard</CardTitle>
      <Card>
        <h2>ADMIN</h2>
      </Card>
    </DashboardLayoutWrapper>
  );
}
