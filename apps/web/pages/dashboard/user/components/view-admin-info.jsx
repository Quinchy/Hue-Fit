// components/ViewVendorInfo.js
import { Card, CardTitle } from "@/components/ui/card";

export default function ViewVendorInfo({ user = {} }) {
  return (
    <Card className="p-6 shadow-md w-full">
      <CardTitle className="text-xl font-semibold mb-4">Vendor Information</CardTitle>
      <div className="space-y-3">
        <p><strong>First Name:</strong> {user.firstName || "N/A"}</p>
        <p><strong>Last Name:</strong> {user.lastName || "N/A"}</p>
        <p><strong>Username:</strong> {user.username || "N/A"}</p>
        <p><strong>Status:</strong> {user.status || "N/A"}</p>
        <p><strong>Role:</strong> {user.role || "N/A"}</p>
        <p><strong>Shop:</strong> {user.shopName || "N/A"}</p>
        <p><strong>Date Created:</strong> {user.dateCreated || "N/A"}</p>
      </div>
    </Card>
  );
}
