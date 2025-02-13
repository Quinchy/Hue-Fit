// File: "pages/dashboard.js"
import { useSession } from "next-auth/react";
import AdminNotification from "@/components/ui/notification/admin-notifs";
import VendorNotification from "@/components/ui/notification/vendor-notifs";

export default function Notification() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  if (userRole === "ADMIN") {
    return <AdminNotification />;
  } else if (userRole === "VENDOR") {
    return <VendorNotification />;
  } else {
    return <p>No notifications available.</p>;
  }
}
