// File: "pages/dashboard.js"
import { useSession } from "next-auth/react";
import AdminDashboard from "@/components/ui/dashboard/admin";
import VendorDashboard from "@/components/ui/dashboard/vendor";

export default function Dashboard() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (userRole === "ADMIN") {
    return <AdminDashboard />;
  } else if (userRole === "VENDOR") {
    return <VendorDashboard />;  
  } else {
    return <p>User role not recognized.</p>;
  }
}
