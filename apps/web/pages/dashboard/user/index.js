import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { CardTitle } from "@/components/ui/card";

export default function User() {
  return (
    <DashboardLayoutWrapper>
      <CardTitle className="text-4xl">Users</CardTitle>
    </DashboardLayoutWrapper>
  )
}