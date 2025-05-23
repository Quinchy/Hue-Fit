// components/ViewVendorInfo.js
import { Card, CardTitle } from "@/components/ui/card";

export default function ViewVendorInfo({ user = {} }) {
  return (
    <Card className="flex flex-col p-5 gap-5 shadow-md w-full">
      <CardTitle className="text-xl font-semibold">Vendor Information</CardTitle>
      <div className="space-y-1">
        <p className="font-thin">
          <strong>User No:</strong> {user.userNo || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Username:</strong> {user.username || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Role:</strong> {user.role || "N/A"}
        </p>
        <p className="font-thin">
          <strong>First Name:</strong> {user.firstName || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Last Name:</strong> {user.lastName || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Email:</strong> {user.email || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Contact No:</strong> {user.contactNo || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Position:</strong> {user.position || "N/A"}
        </p>
        <p className="font-thin">
          <strong>Shop Name:</strong> {user.shop?.name || "N/A"}
        </p>
      </div>
    </Card>
  );
}
