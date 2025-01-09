// File: "@/components/ui/dashboard/vendor.js"
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";

export default function VendorDashboard() {
  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">Dashboard</CardTitle>
      <Card>
        <h2>VENDOR</h2>
      </Card>
    </DashboardLayoutWrapper>
  );
}
